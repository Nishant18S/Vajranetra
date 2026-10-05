import { useForecast } from '../../hooks/useForecast';
import HorizonGrid from './HorizonGrid';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import Skeleton from '../common/Skeleton';
import { STATUS } from '../../utils/constants';
import { fmtDateTime } from '../../utils/formatters';

export default function LatestForecastPanel() {
  const { forecast, state, error, refresh } = useForecast();

  return (
    <section className="vn-panel">
      <div className="vn-panel__hd">
        <h3 className="vn-panel__title">Latest forecast</h3>
        {forecast?.generated_at && (
          <span className="text-[11px] text-slate-500 font-mono">
            {fmtDateTime(forecast.generated_at)}
          </span>
        )}
      </div>
      <div className="p-4">
        {state === STATUS.LOADING && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        )}
        {state === STATUS.ERROR && <ErrorState error={error} onRetry={refresh} />}
        {state === STATUS.EMPTY && (
          <EmptyState
            title="No new forecast available."
            hint="Run inference from the Forecast page to generate one."
          />
        )}
        {state === STATUS.SUCCESS && forecast?.forecasts?.length > 0 && (
          <HorizonGrid forecasts={forecast.forecasts} />
        )}
      </div>
    </section>
  );
}