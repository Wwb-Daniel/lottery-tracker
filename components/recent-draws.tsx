"use client"

import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Calendar, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Lottery {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

interface LotteryResult {
  id: string
  lottery_id: string
  draw_date: string
  draw_time: string
  game_type: string
  numbers: string[]
  subtitle: string | null
  result_order: number
  created_at: string
  updated_at: string
  lotteries: Lottery
}

const RecentDraws = () => {
  const [selectedLottery, setSelectedLottery] = useState("all")
  const [results, setResults] = useState<LotteryResult[]>([])
  const [lotteries, setLotteries] = useState<Lottery[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLotteries = async () => {
      try {
        const { data, error } = await supabase.from("lotteries").select("*").order("name")

        if (error) throw error
        setLotteries(data || [])
      } catch (err) {
        console.error("Error fetching lotteries:", err)
        setError("No se pudieron cargar las loterías.")
      }
    }

    fetchLotteries()
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)

        let query = supabase
          .from("lottery_results")
          .select(`
            *,
            lotteries!fk_lottery_result (
              name
            )
          `)
          .order("draw_date", { ascending: false })
          .order("draw_time", { ascending: false })
          .limit(12)

        if (selectedLottery !== "all") {
          const { data: lottery, error: lotteryError } = await supabase
            .from("lotteries")
            .select("id")
            .eq("name", selectedLottery)
            .maybeSingle()

          if (lotteryError) throw lotteryError
          if (lottery) {
            query = query.eq("lottery_id", lottery.id)
          }
        }

        const { data, error } = await query

        if (error) throw error
        setResults(data || [])
      } catch (err) {
        console.error("Error fetching results:", err)
        setError("No se pudieron cargar los resultados.")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [selectedLottery])

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "d 'de' MMMM", { locale: es })
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-medium">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group results by date first, then by lottery and game type
  const groupedResults = results.reduce(
    (acc, result) => {
      const date = result.draw_date
      if (!acc[date]) {
        acc[date] = {}
      }

      const lotteryName = result.lotteries.name
      if (!acc[date][lotteryName]) {
        acc[date][lotteryName] = {}
      }

      if (!acc[date][lotteryName][result.game_type]) {
        acc[date][lotteryName][result.game_type] = []
      }

      acc[date][lotteryName][result.game_type].push(result)
      return acc
    },
    {} as Record<string, Record<string, Record<string, LotteryResult[]>>>,
  )

  const NumberBall = ({ number, index }: { number: string; index: number }) => (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        duration: 0.2,
        delay: index * 0.05,
      }}
      className="relative group/number flex-shrink-0"
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary dark:via-primary/95 dark:to-primary/85 flex items-center justify-center shadow-lg shadow-primary/25 dark:shadow-primary/40 border border-primary/20 dark:border-primary/30 group-hover/number:scale-110 transition-transform duration-200">
        <span className="text-xs sm:text-sm font-bold text-primary-foreground drop-shadow-sm">
          {number != null ? String(number).padStart(2, "0") : '--'}
        </span>
      </div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent dark:from-white/10 pointer-events-none" />
    </motion.div>
  )

  const LoadingSkeleton = () => (
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="space-y-6">
          <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2].map((j) => (
              <div key={j} className="space-y-4">
                <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                <div className="space-y-4">
                  {[1, 2].map((k) => (
                    <Card key={k}>
                      <CardHeader className="pb-2 px-4 sm:px-6">
                        <Skeleton className="h-4 w-16" />
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6">
                        <div className="flex justify-center gap-2 sm:gap-3">
                          {[1, 2, 3, 4].map((l) => (
                            <Skeleton key={l} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <p className="text-muted-foreground">Mostrando los últimos resultados de los sorteos</p>
        </div>
        <Select value={selectedLottery} onValueChange={setSelectedLottery}>
          <SelectTrigger className="w-full sm:w-[200px] bg-background">
            <SelectValue placeholder="Todas las loterías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las loterías</SelectItem>
            {lotteries.map((lottery) => (
              <SelectItem key={lottery.id} value={lottery.name}>
                {lottery.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedResults).map(([date, lotteries]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                <h2 className="text-lg sm:text-xl font-bold text-foreground">{formatDate(date)}</h2>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                {Object.entries(lotteries).map(([lotteryName, gameTypes]) => (
                  <motion.div
                    key={lotteryName}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full flex-shrink-0" />
                      <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{lotteryName}</h3>
                    </div>

                    {Object.entries(gameTypes).map(([gameType, gameResults]) => (
                      <div key={gameType} className="space-y-3">
                        <Badge variant="secondary" className="text-xs font-medium">
                          {gameType}
                        </Badge>

                        <div className="space-y-4">
                          {gameResults.map((result, index) => (
                            <motion.div
                              key={result.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                            >
                              <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                                <CardHeader className="pb-3 px-4 sm:px-6">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-foreground"
                                      >
                                        {result.draw_time}
                                      </Badge>
                                    </div>
                                    {result.subtitle && (
                                      <CardDescription className="text-xs text-muted-foreground sm:text-right">
                                        {result.subtitle}
                                      </CardDescription>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="pt-0 px-4 sm:px-6 pb-4 sm:pb-6">
                                  {/* Responsive number grid */}
                                  <div className="w-full">
                                    {result.numbers.length <= 4 ? (
                                      // For 4 or fewer numbers: single row, centered
                                      <div className="flex justify-center items-center gap-2 sm:gap-3">
                                        {result.numbers.map((number: string, i: number) => (
                                          <NumberBall key={i} number={number} index={i} />
                                        ))}
                                      </div>
                                    ) : result.numbers.length <= 6 ? (
                                      // For 5-6 numbers: try to fit in one row on larger screens, wrap on mobile
                                      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 max-w-sm mx-auto">
                                        {result.numbers.map((number: string, i: number) => (
                                          <NumberBall key={i} number={number} index={i} />
                                        ))}
                                      </div>
                                    ) : (
                                      // For more than 6 numbers: organized grid
                                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 justify-items-center max-w-md mx-auto">
                                        {result.numbers.map((number: string, i: number) => (
                                          <NumberBall key={i} number={number} index={i} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {Object.keys(groupedResults).length === 0 && !loading && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">No hay resultados disponibles</h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-sm mx-auto">
                    No se encontraron sorteos para los filtros seleccionados. Intenta cambiar la lotería o verifica más
                    tarde.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default RecentDraws
