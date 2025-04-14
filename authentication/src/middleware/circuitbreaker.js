import CircuitBreaker from 'opossum';

function circuitBreaker(action) {
  const options = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 5000,
  };

  const breaker = new CircuitBreaker(action, options);

  return breaker.fire().catch((err) => {
    throw new Error(`Circuit breaker triggered: ${err.message}`);
  });
}

export default circuitBreaker;
