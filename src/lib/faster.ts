// FASTER Scale content.
// Adapted from the Genesis Process by Michael Dye, as published by Pure Desire Ministries
// (puredesire.org). Two variants: one for people in recovery, one for betrayed partners.

export type Role = 'recovery' | 'partner';

export type StageKey =
	| 'restoration'
	| 'forgetting'
	| 'anxiety'
	| 'speeding'
	| 'ticked'
	| 'exhausted'
	| 'relapse';

export interface Stage {
	key: StageKey;
	letter: string;
	name: string;
	description: string;
	behaviors: string[];
}

/** Index 0 = Restoration (healthy), 6 = Relapse/Regression (lowest). */
export const STAGE_ORDER: StageKey[] = [
	'restoration',
	'forgetting',
	'anxiety',
	'speeding',
	'ticked',
	'exhausted',
	'relapse'
];

const recoveryStages: Stage[] = [
	{
		key: 'restoration',
		letter: 'R',
		name: 'Restoration',
		description:
			'Accepting life on God’s terms, with trust, grace, mercy, vulnerability, and gratitude.',
		behaviors: [
			'No current secrets',
			'Working to resolve problems',
			'Identifying fears and feelings',
			'Keeping commitments to meetings, prayer, family, church, people, goals, and self',
			'Being open and honest',
			'Making eye contact',
			'Increasing in relationships with God and others',
			'True accountability'
		]
	},
	{
		key: 'forgetting',
		letter: 'F',
		name: 'Forgetting Priorities',
		description:
			'Start believing the present circumstances and moving away from trusting God.',
		behaviors: [
			'Denial',
			'Flight',
			'A change in what’s important (how you spend your time, energy, & thoughts)',
			'Secrets',
			'Less time/energy for God, meetings, church',
			'Avoiding support and accountability people',
			'Superficial conversations',
			'Sarcasm',
			'Isolating',
			'Changes in goals',
			'Obsessed with relationships',
			'Breaking promises & commitments',
			'Neglecting family',
			'Preoccupation with material things, TV, computers, entertainment',
			'Procrastination',
			'Lying',
			'Overconfidence',
			'Bored',
			'Hiding money',
			'Image management',
			'Seeking to control situations and other people'
		]
	},
	{
		key: 'anxiety',
		letter: 'A',
		name: 'Anxiety',
		description: 'A growing background noise of undefined fear; getting energy from emotions.',
		behaviors: [
			'Worry',
			'Using profanity',
			'Being fearful',
			'Being resentful',
			'Replaying old, negative thoughts',
			'Perfectionism',
			'Judging other’s motives',
			'Making goals/lists you can’t complete',
			'Mind reading',
			'Fantasy',
			'Codependent rescuing',
			'Sleep problems',
			'Trouble concentrating',
			'Seeking/creating drama',
			'Gossip',
			'Using over-the-counter medication for pain, sleep or weight control',
			'Flirting'
		]
	},
	{
		key: 'speeding',
		letter: 'S',
		name: 'Speeding Up',
		description: 'Trying to outrun the anxiety, which is usually the first sign of depression.',
		behaviors: [
			'Super busy and always in a hurry (finding good reason to justify the work)',
			'Workaholic',
			'Can’t relax',
			'Avoiding slowing down',
			'Feeling driven',
			'Can’t turn off thoughts',
			'Skipping meals',
			'Binge eating (usually at night)',
			'Overspending',
			'Can’t identify own feelings/needs',
			'Repetitive negative thoughts',
			'Irritable',
			'Dramatic mood swings',
			'Too much caffeine',
			'Over-exercising',
			'Nervousness',
			'Difficulty being alone/with people',
			'Difficulty listening to others',
			'Making excuses for having to “do it all”'
		]
	},
	{
		key: 'ticked',
		letter: 'T',
		name: 'Ticked Off',
		description: 'Getting adrenaline high on anger and aggression.',
		behaviors: [
			'Procrastination causing crisis in money, work, and relationships',
			'Increased sarcasm',
			'Black and white (all or nothing) thinking',
			'Feeling alone',
			'Nobody understands',
			'Overreacting',
			'Road rage',
			'Constant resentments',
			'Pushing others away',
			'Increasing isolation',
			'Blaming',
			'Arguing',
			'Irrational thinking',
			'Can’t take criticism',
			'Defensive',
			'People avoiding you',
			'Needing to be right',
			'Digestive problems',
			'Headaches',
			'Obsessive (stuck) thoughts',
			'Can’t forgive',
			'Feeling superior',
			'Using intimidation'
		]
	},
	{
		key: 'exhausted',
		letter: 'E',
		name: 'Exhausted',
		description:
			'Loss of physical and emotional energy; coming off the adrenaline high, and the onset of depression.',
		behaviors: [
			'Depressed',
			'Panicked',
			'Confused',
			'Hopelessness',
			'Sleeping too much or too little',
			'Can’t cope',
			'Overwhelmed',
			'Crying for “no reason”',
			'Can’t think',
			'Forgetful',
			'Pessimistic',
			'Helpless',
			'Tired',
			'Numb',
			'Wanting to run',
			'Constant cravings for old coping behaviors',
			'Thinking of using sex, drugs, or alcohol',
			'Seeking old unhealthy people & places',
			'Really isolating',
			'People angry with you',
			'Self-abuse',
			'Suicidal thoughts',
			'Spontaneous crying',
			'No goals',
			'Survival mode',
			'Not returning phone calls',
			'Missing work',
			'Irritability',
			'No appetite'
		]
	},
	{
		key: 'relapse',
		letter: 'R',
		name: 'Relapse',
		description:
			'Returning to the place you swore you would never go again. Coping with life on your terms. You sitting in the driver’s seat instead of God.',
		behaviors: [
			'Giving up and giving in',
			'Out of control',
			'Lost in your addiction',
			'Lying to yourself and others',
			'Feeling you just can’t manage without your coping behaviors, at least for now'
		]
	}
];

const partnerStages: Stage[] = [
	{
		key: 'restoration',
		letter: 'R',
		name: 'Restoration',
		description:
			'Accepting life on God’s terms, with trust, grace, mercy, vulnerability and gratitude.',
		behaviors: [
			'No current secrets',
			'Working to resolve problems',
			'Identifying fears and feelings',
			'Keeping commitments to meetings, prayer, family, church, people, goals, and self',
			'Being open and honest',
			'Making eye contact',
			'Increasing in relationships with God and others',
			'True accountability'
		]
	},
	{
		key: 'forgetting',
		letter: 'F',
		name: 'Forgetting Priorities',
		description:
			'Feeling powerless to change the present circumstances and moving away from trusting God.',
		behaviors: [
			'Denial',
			'Flight',
			'A change in what’s important (how you spend your time, energy, and thoughts)',
			'Secrets',
			'Less time/energy for God, meetings, church',
			'Avoiding group support',
			'Superficial conversations',
			'Sarcasm',
			'Isolating',
			'Changes in goals',
			'Obsessed with relationships',
			'Breaking promises and commitments',
			'Neglecting family',
			'Lack of self-care',
			'Preoccupation with material things, TV, computers, entertainment',
			'Procrastination',
			'Lying',
			'Overconfidence'
		]
	},
	{
		key: 'anxiety',
		letter: 'A',
		name: 'Anxiety',
		description: 'Consumed by negative thoughts and undefined fear; getting energy from emotions.',
		behaviors: [
			'Worry',
			'Using profanity',
			'Being fearful',
			'Being resentful',
			'Replaying old, negative thoughts',
			'Perfectionism',
			'Judging other’s motives',
			'Making goals and lists that you can’t complete',
			'Mind reading',
			'Fantasy',
			'Hypervigilance',
			'Sleep problems',
			'Trouble concentrating',
			'Seeking/creating drama',
			'Gossip',
			'Using over-the-counter medication for pain, sleep or weight control',
			'Suspiciousness',
			'Catastrophic thinking'
		]
	},
	{
		key: 'speeding',
		letter: 'S',
		name: 'Speeding Up',
		description: 'Trying to outrun the anxiety, which is usually the first sign of depression.',
		behaviors: [
			'Super busy and always in a hurry (finding good reason to justify the work)',
			'Workaholic',
			'Can’t relax',
			'Avoiding slowing down',
			'Feeling driven',
			'Can’t turn off thoughts',
			'Skipping meals',
			'Binge eating (usually at night)',
			'Experiencing false guilt',
			'Overspending',
			'Can’t identify own feelings/needs',
			'Repetitive negative thoughts',
			'Irritable',
			'Dramatic mood swings',
			'Too much caffeine',
			'Over exercising',
			'Nervousness',
			'Difficulty being alone and/or with people',
			'Difficulty listening to others',
			'Avoiding support',
			'Making excuses for having to “do it all”'
		]
	},
	{
		key: 'ticked',
		letter: 'T',
		name: 'Ticked Off',
		description: 'Getting adrenaline high on anger and aggression.',
		behaviors: [
			'Procrastination causing crisis in money, work, and relationships',
			'Increased sarcasm',
			'Black and white (all or nothing) thinking',
			'Feeling alone',
			'Nobody understands',
			'Overreacting',
			'Road rage',
			'Constant resentments',
			'Pushing others away',
			'Increasing isolation',
			'Blaming',
			'Arguing',
			'Irrational thinking',
			'Can’t take criticism',
			'Defensive',
			'People avoiding you',
			'Needing to be right',
			'Digestive problems',
			'Headaches',
			'Obsessive (stuck) thoughts',
			'Can’t forgive',
			'Feeling superior',
			'Using intimidation',
			'Seeking confrontation',
			'Passive-aggressive behaviors',
			'Thoughts of getting even/revenge'
		]
	},
	{
		key: 'exhausted',
		letter: 'E',
		name: 'Exhausted',
		description:
			'Loss of physical and emotional energy; coming off the adrenaline high, and the onset of depression.',
		behaviors: [
			'Depressed',
			'Panicked',
			'Confused',
			'Hopelessness',
			'Sleeping too much or too little',
			'Can’t cope',
			'Overwhelmed',
			'Crying for “no reason”',
			'Can’t think',
			'Forgetful',
			'Pessimistic',
			'Helpless',
			'Tired',
			'Numb',
			'Wanting to run',
			'Constant cravings for old coping behaviors',
			'Thinking of using sex, drugs, or alcohol',
			'Really isolating',
			'People angry with you',
			'Self-abuse',
			'Suicidal thoughts',
			'Spontaneous crying',
			'No goals',
			'Survival mode',
			'Not returning phone calls',
			'Missing work',
			'Irritability',
			'No appetite',
			'Feeling powerless',
			'Victim mentality',
			'Short-term memory loss'
		]
	},
	{
		key: 'relapse',
		letter: 'R',
		name: 'Regression',
		description: 'Stalled or moving backward in your healing.',
		behaviors: [
			'Feeling unsafe',
			'Unable to regulate emotions',
			'Sleep disturbances (sleeping too much or too little)',
			'Ruminating about discovery/disclosure',
			'Feeling unusually fearful',
			'Binge eating',
			'Using alcohol and drugs to cope',
			'Symptoms of physical distress: headaches, stomach aches, nausea',
			'Easily startled',
			'Anorexia',
			'Bulimia',
			'Flirting',
			'Obsessed with social media',
			'Unable to trust God and others',
			'For divorced partners: engaging in new relationships without support/accountability'
		]
	}
];

export function stagesFor(role: Role): Stage[] {
	return role === 'partner' ? partnerStages : recoveryStages;
}

export function stageFor(role: Role, key: StageKey): Stage {
	return stagesFor(role).find((s) => s.key === key)!;
}

export function stageIndex(key: StageKey): number {
	return STAGE_ORDER.indexOf(key);
}

export function stageName(role: Role, key: StageKey) {
	return stageFor(role, key).name;
}

/** Tailwind classes per stage. A cool-to-warm progression; Restoration is calm green. */
export const STAGE_STYLE: Record<StageKey, { dot: string; soft: string; text: string; ring: string; hex: string }> = {
	restoration: { dot: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-500/30', hex: '#10b981' },
	forgetting: { dot: 'bg-lime-500', soft: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-700 dark:text-lime-300', ring: 'ring-lime-500/30', hex: '#84cc16' },
	anxiety: { dot: 'bg-yellow-500', soft: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-700 dark:text-yellow-300', ring: 'ring-yellow-500/30', hex: '#eab308' },
	speeding: { dot: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-500/30', hex: '#f59e0b' },
	ticked: { dot: 'bg-orange-500', soft: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-500/30', hex: '#f97316' },
	exhausted: { dot: 'bg-red-500', soft: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-300', ring: 'ring-red-500/30', hex: '#ef4444' },
	relapse: { dot: 'bg-rose-700', soft: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300', ring: 'ring-rose-700/30', hex: '#be123c' }
};

/** Behaviors that should immediately surface crisis resources. */
export const CRISIS_BEHAVIORS = ['Suicidal thoughts', 'Self-abuse'];

export type Selections = Partial<Record<StageKey, string[]>>;

/** Lowest (most severe) stage that has at least one selected behavior; Restoration if none. */
export function computeLowest(selections: Selections): StageKey {
	for (let i = STAGE_ORDER.length - 1; i >= 1; i--) {
		const k = STAGE_ORDER[i];
		if ((selections[k]?.length ?? 0) > 0) return k;
	}
	return 'restoration';
}

export const PART_TWO_QUESTIONS = [
	'How does it affect me? How do I feel in the moment?',
	'How does it affect the important people in my life?',
	'Why do I do this? What is the benefit for me?'
];

export interface WeeklyQuestion {
	key: string;
	label: string;
	sub?: string;
}

export const WEEKLY_QUESTIONS: WeeklyQuestion[] = [
	{ key: 'doubleBind', label: 'What was the Double Bind you were dealing with?' },
	{
		key: 'commitment',
		label: 'Where are you on the Commitment to Change you made at the end of your last meeting?'
	},
	{ key: 'lied', label: 'Have you lied to anyone this week, either directly or indirectly?' },
	{
		key: 'relationship',
		label: 'If you are married, what have you done to improve your relationship with your spouse this week?'
	},
	{ key: 'change', label: 'What area do you need to change or what challenge are you facing next week?' },
	{ key: 'costIfChange', label: 'What will it cost you emotionally if you do change?' },
	{ key: 'fear', label: 'What fear do you feel with what you have chosen to change?' },
	{ key: 'costIfNot', label: 'What will it cost you if you don’t change?' },
	{ key: 'plan', label: 'What is your plan to maintain your restoration regarding these changes?' },
	{
		key: 'accountability',
		label: 'Who will keep you accountable to this commitment? What are the details? What questions should they ask you?'
	}
];

export interface ChecklistItem {
	key: string;
	label: string;
	sub?: string[];
}

export const RESTORATION_CHECKLIST: ChecklistItem[] = [
	{ key: 'noSecrets', label: 'No current secrets' },
	{ key: 'resolving', label: 'Resolving problems' },
	{ key: 'fears', label: 'Identifying fears and feelings' },
	{
		key: 'commitments',
		label: 'Keeping commitments',
		sub: ['Meeting', 'Prayer', 'Family', 'Church', 'People', 'Goals', 'Self']
	},
	{ key: 'open', label: 'Being open' },
	{ key: 'honest', label: 'Being honest' },
	{ key: 'eyeContact', label: 'Making eye contact' },
	{ key: 'reachingOut', label: 'Reaching out to others' },
	{ key: 'relationship', label: 'Increasing in relationship with God and others' },
	{ key: 'accountability', label: 'Accountability' }
];

export function roleLabel(role: Role) {
	return role === 'partner' ? 'Betrayed partner' : 'In recovery';
}
