import PredictionsHeader from '@/components/predictions/predictions-header';
import PredictionMethod from '@/components/predictions/prediction-method';
import PredictionGenerator from '@/components/predictions/prediction-generator';

export default function PredictionsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <PredictionsHeader />
      
      <div className="mt-8 space-y-10">
        <PredictionGenerator />
        <PredictionMethod />
      </div>
    </div>
  );
}