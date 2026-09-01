import { getCityOffices } from './government.ts';

export type GovernmentContactAvailability = 'all' | 'phone' | 'email' | 'both';
export type GovernmentContactSort = 'name-asc' | 'name-desc';

export type GovernmentContactRecord = Readonly<{
  officeId: string;
  officeName: string;
  acronym: string | null;
  phone: string | null;
  phoneExtensions: readonly string[];
  emails: readonly string[];
  address: string;
  sourceUrls: readonly string[];
  lastVerifiedAt: string;
}>;

function uniqueValues(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value)))
  );
}

const contacts: readonly GovernmentContactRecord[] = Object.freeze(
  getCityOffices().map(office =>
    Object.freeze({
      officeId: office.office_id,
      officeName: office.office_name,
      acronym: office.acronym ?? null,
      phone: office.primary_phone ?? null,
      phoneExtensions: Object.freeze([...(office.phone_extensions ?? [])]),
      emails: Object.freeze(
        uniqueValues([
          office.institutional_email,
          office.operational_email,
          ...(office.additional_emails ?? []),
        ])
      ),
      address: office.physical_address,
      sourceUrls: Object.freeze([...office.source_urls]),
      lastVerifiedAt: office.last_verified_at,
    })
  )
);

export function getGovernmentContactRecords() {
  return contacts;
}

export function getGovernmentContactSummary() {
  return Object.freeze({
    total: contacts.length,
    withPhone: contacts.filter(record => record.phone).length,
    withEmail: contacts.filter(record => record.emails.length > 0).length,
    withBoth: contacts.filter(
      record => record.phone && record.emails.length > 0
    ).length,
    withAddress: contacts.filter(record => record.address).length,
  });
}

export function filterAndSortGovernmentContacts(
  records: readonly GovernmentContactRecord[],
  options: Readonly<{
    query: string;
    availability: GovernmentContactAvailability;
    sort: GovernmentContactSort;
  }>
) {
  const query = options.query.trim().toLocaleLowerCase('en-PH');

  return records
    .filter(record => {
      const matchesAvailability =
        options.availability === 'all' ||
        (options.availability === 'phone' && Boolean(record.phone)) ||
        (options.availability === 'email' && record.emails.length > 0) ||
        (options.availability === 'both' &&
          Boolean(record.phone) &&
          record.emails.length > 0);
      const matchesQuery =
        !query ||
        [
          record.officeName,
          record.acronym,
          record.phone,
          record.address,
          ...record.phoneExtensions,
          ...record.emails,
        ]
          .filter((value): value is string => Boolean(value))
          .some(value => value.toLocaleLowerCase('en-PH').includes(query));

      return matchesAvailability && matchesQuery;
    })
    .sort((left, right) => {
      const comparison = left.officeName.localeCompare(
        right.officeName,
        'en-PH'
      );
      return options.sort === 'name-desc' ? -comparison : comparison;
    });
}
