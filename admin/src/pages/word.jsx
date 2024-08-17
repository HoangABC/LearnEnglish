import { Helmet } from 'react-helmet-async';

import { WordView } from '../sections/word/view';

// ----------------------------------------------------------------------

export default function WordPage() {
  return (
    <>
      <Helmet>
        <title> Word | Minimal UI </title>
      </Helmet>

      <WordView />
    </>
  );
}
