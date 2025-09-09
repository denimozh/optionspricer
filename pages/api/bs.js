// pages/api/bs.js
export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const body = req.body;

  function norm_pdf(x) { return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI); }
  function norm_cdf(x) { 
    const erf = (x)=> { 
      const sign = x>=0?1:-1; x=Math.abs(x);
      const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
      const t=1/(1+p*x);
      return sign*(1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x));
    };
    return 0.5*(1+erf(x/Math.sqrt(2)));
  }

  function bsMetrics(S,K,T,r,sigma){
    const sqrtT=Math.sqrt(T);
    const d1=(Math.log(S/K)+(r+0.5*sigma*sigma)*T)/(sigma*sqrtT);
    const d2=d1-sqrtT*sigma;
    const Nd1=norm_cdf(d1), Nd2=norm_cdf(d2);
    const Nmd1=norm_cdf(-d1), Nmd2=norm_cdf(-d2);
    const nd1=norm_pdf(d1);
    const call=S*Nd1-K*Math.exp(-r*T)*Nd2;
    const put=K*Math.exp(-r*T)*Nmd2-S*Nmd1;
    const delta_call=Nd1;
    const delta_put=Nd1-1;
    const gamma=nd1/(S*sigma*sqrtT);
    return { call, put, delta_call, delta_put, gamma };
  }

  // IV solver using bisection (more robust than Newton-Raphson)
  function impliedVol(price,S,K,T,r,optionType){
    let low=0.001, high=5.0, mid;
    const tol=1e-6, maxIter=100;
    for(let i=0;i<maxIter;i++){
      mid=(low+high)/2;
      const { call, put } = bsMetrics(S,K,T,r,mid);
      const modelPrice = optionType==='call'?call:put;
      if(Math.abs(modelPrice-price)<tol) return mid;
      if(modelPrice>price) high=mid;
      else low=mid;
    }
    return null;
  }

  const { action } = body;

  if(action==='implied_vol'){
    const { market_price, S, K, T, r, optionType } = body;
    const iv = impliedVol(market_price, S, K, T, r, optionType);
    return res.status(200).json({ implied_vol: iv });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
