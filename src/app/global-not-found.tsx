import RootLayout from './[locale]/layout';
import NotFound, {
  generateMetadata as getNotFoundMetadata,
} from './[locale]/not-found';
import { getLocale } from '../i18n/server';
import { getRootMetadata } from '../lib/metadata';

export async function generateMetadata() {
  return {
    ...getRootMetadata(await getLocale()),
    ...(await getNotFoundMetadata()),
  };
}

export default function GlobalNotFound() {
  return (
    <RootLayout>
      <NotFound />
    </RootLayout>
  );
}
