'use client';

import { useTranslation } from 'react-i18next';
import { Text } from './Text';

export default function PageLoading() {
  const { t } = useTranslation('common');

  return (
    <div
      className="flex justify-center items-center p-12"
      role="status"
      aria-live="polite"
    >
      <Text>{t('status.loading')}</Text>
    </div>
  );
}
