import type { Role, StageKey } from './faster';

export interface Resource {
	title: string;
	url: string;
	description: string;
	roles?: Role[];
}

export const CRISIS_RESOURCES: Resource[] = [
	{
		title: '988 Suicide & Crisis Lifeline',
		url: 'tel:988',
		description: 'Call or text 988 (US), 24/7. You are not alone.'
	},
	{
		title: 'Crisis Text Line',
		url: 'sms:741741?body=HOME',
		description: 'Text HOME to 741741 to reach a trained crisis counselor.'
	},
	{
		title: 'Find a helpline outside the US',
		url: 'https://findahelpline.com',
		description: 'Free, confidential support lines in your country.'
	}
];

export const GENERAL_RESOURCES: Resource[] = [
	{
		title: 'Pure Desire Ministries',
		url: 'https://puredesire.org',
		description: 'Groups, counseling and curriculum for men, women and betrayed partners.'
	},
	{
		title: 'Pure Desire groups',
		url: 'https://puredesire.org/groups/',
		description: 'Find a Pure Desire group near you or online.'
	},
	{
		title: 'Sexaholics Anonymous',
		url: 'https://www.sa.org',
		description: '12-step fellowship; in-person and online meetings.',
		roles: ['recovery']
	},
	{
		title: 'S-Anon',
		url: 'https://sanon.org',
		description: '12-step fellowship for those affected by another’s sexual behavior.',
		roles: ['partner']
	},
	{
		title: 'APSATS',
		url: 'https://www.apsats.org',
		description: 'Find a trauma-informed counselor for partners of sex addicts.',
		roles: ['partner']
	},
	{
		title: 'Psychology Today therapist finder',
		url: 'https://www.psychologytoday.com/us/therapists',
		description: 'Search for a licensed counselor near you.'
	}
];

/** Short, practical next steps for returning toward Restoration from each stage. */
export const STAGE_ACTIONS: Record<StageKey, string[]> = {
	restoration: [
		'Keep doing what’s working — review your Restoration Checklist.',
		'Thank someone in your support network today.',
		'Keep your meeting and accountability commitments this week.'
	],
	forgetting: [
		'Name your priorities out loud: what has slipped this week?',
		'Reconnect with God, your group, or your accountability partner today.',
		'Bring any secret into the light with a safe person.'
	],
	anxiety: [
		'Write down the fear underneath the worry. What is it really about?',
		'Take ten slow breaths, then call or text a safe person.',
		'Limit the replaying: set a 10-minute “worry window” and then move on.'
	],
	speeding: [
		'Slow down on purpose: schedule 20 minutes of unhurried rest today.',
		'Eat a real meal and cut back on caffeine.',
		'Ask: what feeling am I trying to outrun?'
	],
	ticked: [
		'Pause before responding — step away for 20 minutes.',
		'Tell your accountability partner what you are angry about.',
		'Look for the hurt or fear beneath the anger.'
	],
	exhausted: [
		'Reach out now — don’t wait. Call your sponsor, partner, or counselor.',
		'Get rest, water, and food. Your body needs care.',
		'If you have thoughts of harming yourself, call or text 988 right away.'
	],
	relapse: [
		'You are not beyond hope. Reach out to your accountability partner today.',
		'Be honest about what happened with a safe person — shame grows in secret.',
		'Re-engage with your group and counselor, and work the Restoration Checklist.'
	]
};

export function resourcesFor(role: Role) {
	return GENERAL_RESOURCES.filter((r) => !r.roles || r.roles.includes(role));
}
