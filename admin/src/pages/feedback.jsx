import { Helmet } from 'react-helmet-async';

import { FeedbackView } from '../sections/feedback/view';

// ----------------------------------------------------------------------

export default function FeedbackPage() {
  return (
    <>
      <Helmet>
        <title> Word | Minimal UI </title>
      </Helmet>

      <FeedbackView />
    </>
  );
}
