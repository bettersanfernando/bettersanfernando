import { Text } from './Text';

export default function PageLoading() {
  return (
    <div
      className="flex justify-center items-center p-12"
      role="status"
      aria-live="polite"
    >
      <Text>Loading…</Text>
    </div>
  );
}
