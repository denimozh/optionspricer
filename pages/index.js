import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });

export default function OptionsGreeksCalculator() {
  const [inputs, setInputs] = useState({
    S: 100,
    K: 100,
    T_days: 30,
    r: 0.05,
    sigma: 0.2,
    optionType: 'call'
  });

  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState(null);

  // --- Black-Scholes ---
  function norm_pdf(x) { return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI); }
  function erfApprox(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const t = 1 / (1 + p * x);
    return sign * (1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x));
  }
  function norm_cdf(x) { return 0.5 * (1 + erfApprox(x / Math.sqrt(2))); }

  function bsMetrics(S, K, T, r, sigma) {
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;
    const Nd1 = norm_cdf(d1);
    const Nd2 = norm_cdf(d2);
    const Nmd1 = norm_cdf(-d1);
    const Nmd2 = norm_cdf(-d2);
    const nd1 = norm_pdf(d1);

    const callPrice = S * Nd1 - K * Math.exp(-r * T) * Nd2;
    const putPrice = K * Math.exp(-r * T) * Nmd2 - S * Nmd1;

    const delta_call = Nd1;
    const delta_put = Nd1 - 1;
    const gamma = nd1 / (S * sigma * sqrtT);
    const vega = S * nd1 * sqrtT;
    const theta_call = -(S * nd1 * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * Nd2;
    const theta_put = -(S * nd1 * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * T) * Nmd2;
    const rho_call = K * T * Math.exp(-r * T) * Nd2;
    const rho_put = -K * T * Math.exp(-r * T) * Nmd2;

    return {
      callPrice,
      putPrice,
      delta_call,
      delta_put,
      gamma,
      vega,
      theta_call,
      theta_put,
      rho_call,
      rho_put
    };
  }

  // Recalculate every time inputs change
  useEffect(() => {
    const T = inputs.T_days / 365;
    const res = bsMetrics(inputs.S, inputs.K, T, inputs.r, inputs.sigma);
    setResult(res);

    const pts = 80;
    const S0 = inputs.S;
    const xs = Array.from({ length: pts }, (_, i) => S0 * (0.5 + i / (pts - 1)));

    // Compute Greeks for each X
    const deltaPoints = xs.map(x => ({ x, y: bsMetrics(x, inputs.K, T, inputs.r, inputs.sigma).delta_call }));
    const gammaPoints = xs.map(x => ({ x, y: bsMetrics(x, inputs.K, T, inputs.r, inputs.sigma).gamma }));
    const vegaPoints = xs.map(x => ({ x, y: bsMetrics(x, inputs.K, T, inputs.r, inputs.sigma).vega }));
    const thetaPoints = xs.map(x => ({ x, y: bsMetrics(x, inputs.K, T, inputs.r, inputs.sigma).theta_call }));

    setChartData({
      datasets: [
        { label: 'Delta', data: deltaPoints, borderColor: 'rgba(0,128,128,0.6)', yAxisID: 'y', tension: 0.2, fill: false },
        { label: 'Gamma', data: gammaPoints, borderColor: 'rgba(255,0,0,0.6)', yAxisID: 'y1', tension: 0.2, fill: false },
        { label: 'Vega', data: vegaPoints, borderColor: 'rgba(0,128,0,0.6)', yAxisID: 'y1', tension: 0.2, fill: false },
        { label: 'Theta', data: thetaPoints, borderColor: 'rgba(255,165,0,0.6)', yAxisID: 'y1', tension: 0.2, fill: false }
      ]
    });
  }, [inputs]);

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <h1>Option Greeks Calculator</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
        <label>
          <div style={{ fontSize: 12, color: '#555' }}>Stock Price</div>
          <input type="number" value={inputs.S} onChange={e => setInputs({ ...inputs, S: parseFloat(e.target.value) })} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: '#555' }}>Strike Price</div>
          <input type="number" value={inputs.K} onChange={e => setInputs({ ...inputs, K: parseFloat(e.target.value) })} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: '#555' }}>Days to Expiration</div>
          <input type="number" value={inputs.T_days} onChange={e => setInputs({ ...inputs, T_days: parseFloat(e.target.value) })} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: '#555' }}>Risk-Free Rate (decimal)</div>
          <input type="number" step="any" value={inputs.r} onChange={e => setInputs({ ...inputs, r: parseFloat(e.target.value) })} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: '#555' }}>Volatility (decimal)</div>
          <input type="number" step="any" value={inputs.sigma} onChange={e => setInputs({ ...inputs, sigma: parseFloat(e.target.value) })} style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          <div style={{ fontSize: 12, color: '#555' }}>Option Type</div>
          <select value={inputs.optionType} onChange={e => setInputs({ ...inputs, optionType: e.target.value })} style={{ width: '100%', padding: 8 }}>
            <option value="call">Call</option>
            <option value="put">Put</option>
          </select>
        </label>
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 24, marginBottom: 32 }}>
          <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
            <h3>Option Price & Greeks</h3>
            <div>Theoretical Price: {(inputs.optionType==='call'?result.callPrice:result.putPrice).toFixed(4)} USD</div>
            <div>Delta: {(inputs.optionType==='call'?result.delta_call:result.delta_put).toFixed(4)}</div>
            <div>Gamma: {result.gamma.toFixed(6)}</div>
            <div>Theta: {(inputs.optionType==='call'?result.theta_call:result.theta_put).toFixed(6)}</div>
            <div>Vega: {result.vega.toFixed(4)}</div>
            <div>Rho: {(inputs.optionType==='call'?result.rho_call:result.rho_put).toFixed(4)}</div>
          </div>
        </div>
      )}

      {chartData && (
  <div style={{ marginTop: 32 }}>
    <Line
      data={{
        datasets: [
          ...chartData.datasets,
          // Dummy datasets for legend only
          {
            label: 'Current Price',
            data: [], // No points
            borderColor: 'yellow',
            borderWidth: 2,
          },
          {
            label: 'Strike Price',
            data: [], // No points
            borderColor: 'purple',
            borderWidth: 2,
          }
        ]
      }}
      options={{
        responsive: true,
        parsing: false,
        plugins: {
          legend: { display: true },
          tooltip: {
            enabled: true,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                const datasetLabel = context.dataset.label || '';
                const yValue = context.raw.y?.toFixed(6);
                return yValue ? `${datasetLabel}: ${yValue}` : null;
              }
            }
          },
          annotation: {
            annotations: {
              currentPrice: {
                type: 'line',
                xMin: inputs.S,
                xMax: inputs.S,
                borderColor: 'yellow',
                borderWidth: 2,
                label: { display: true, content: 'Current Price', position: 'start' }
              },
              strikePrice: {
                type: 'line',
                xMin: inputs.K,
                xMax: inputs.K,
                borderColor: 'purple',
                borderWidth: 2,
                label: { display: true, content: 'Strike Price', position: 'start' }
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          axis: 'x',
          intersect: false
        },
        scales: {
          x: { type: 'linear', title: { display: true, text: 'Stock Price' } },
          y: { type: 'linear', position: 'left', title: { display: true, text: 'Delta' } },
          y1: { type: 'linear', position: 'right', title: { display: true, text: 'Gamma / Vega / Theta' } }
        }
      }}
      height={175}
    />
  </div>
)}


    </div>
  );
}
