import sgMail from '@sendgrid/mail';
import config from '../config';

sgMail.setApiKey(config.sendGrid.apiKey);

export default ({sender, receiver, subject, body}) => {
  const msg = {
    to: receiver,
    from: sender,
    subject: subject,
    text: body,
  };

  return sgMail.send(msg)

}
