export type Lottery = {
  id: string;
  name: string;
  country: string;
  website: string;
  drawTimes: string[];
  logo?: string;
};

export type LotteryResult = {
  id: string;
  lottery_id: string;
  draw_date: string;
  draw_time: string;
  numbers: number[];
  created_at: string;
};

export type Prediction = {
  id: string;
  lottery_id: string;
  numbers: number[];
  confidence: number;
  predicted_for_date: string;
  created_at: string;
};

export type ScrapingLog = {
  id: string;
  lottery_id: string;
  status: 'success' | 'error';
  message: string;
  details?: any;
  created_at: string;
};

export type NumberFrequency = {
  number: number;
  frequency: number;
};

export type LotteryStats = {
  lottery_id: string;
  frequency: NumberFrequency[];
  lastDrawDate: string;
  totalDraws: number;
};