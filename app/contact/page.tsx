import ContactPageV2 from '../../components/ContactPageV2';
import { contactPage } from '../../lib/content';

export const metadata = {
  title: contactPage.metaTitle,
  description: contactPage.metaDescription,
};

export default function ContactPage() {
  return <ContactPageV2 />;
}
