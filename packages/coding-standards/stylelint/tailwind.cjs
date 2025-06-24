module.exports = {
	overrides: [
		{
			files: ["*.css", "**/*.css"],
			rules: {
				'at-rule-no-unknown': [
				true,
				{
					ignoreAtRules: [
						'tailwind',
						'apply',
						'variants',
						'responsive',
						'screen',
					],
				},
				]
			},
		},
		{
			files: ["*.scss", "**/*.scss"],
			rules: {
				'scss/at-rule-no-unknown': [
				true,
				{
					ignoreAtRules: [
						'tailwind',
						'apply',
						'variants',
						'responsive',
						'screen',
					],
				},
				]
			},
		},
	]
};
