import { defineEnvVars } from '@sveltejs/kit/env';

const optional = (value: string | undefined) => (value ? value : undefined);

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	PUBLIC_BASE_URL: {
		description: 'Public origin used in emails, e.g. https://faster.ebrouwer.dev',
		schema: (v) => v || 'http://localhost:5173'
	},
	RESEND_API_KEY: {
		description: 'Resend API key. If unset, emails are only logged in-app.',
		schema: optional
	},
	EMAIL_FROM: {
		description: 'From address for outgoing email.',
		schema: (v) => v || 'FASTER Scale <faster@ebrouwer.dev>'
	},
	VAPID_PUBLIC_KEY: {
		public: true,
		description: 'Web push VAPID public key.',
		schema: optional
	},
	VAPID_PRIVATE_KEY: { description: 'Web push VAPID private key.', schema: optional },
	VAPID_SUBJECT: {
		description: 'Web push contact (mailto: or https: URL).',
		schema: (v) => v || 'https://faster.ebrouwer.dev'
	},
	DISABLE_SCHEDULER: {
		description: 'Set to 1 to disable the in-process reminder scheduler.',
		schema: optional
	}
});
