export function subscribeProgress(onMessage) {
  const eventSource = new EventSource('http://localhost:8080/api/progress');

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  return () => eventSource.close();
}
