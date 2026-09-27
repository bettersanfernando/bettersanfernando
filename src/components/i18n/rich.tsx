import { Fragment, type ReactNode } from 'react';

/**
 * Fills `{{name}}` placeholders of an already translated sentence with React
 * nodes, so a translation can reorder emphasised values (a bold count, a link)
 * without splitting the sentence into fragments.
 */
export function withSlots(
  text: string,
  slots: Record<string, ReactNode>
): ReactNode {
  return text.split(/(\{\{\w+\}\})/).map((part, index) => {
    const name = /^\{\{(\w+)\}\}$/.exec(part)?.[1];
    return (
      <Fragment key={index}>
        {name !== undefined && name in slots ? slots[name] : part}
      </Fragment>
    );
  });
}
