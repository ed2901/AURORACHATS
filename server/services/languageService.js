// Custom inappropriate words for customer service
const badWords = [
  'moroso',
  'estafador',
  'fraude',
  'ladrón',
  'incompetente',
  'idiota',
  'imbécil',
  'tonto',
  'basura',
  'mierda',
  'pendejo',
  'cabrón',
  'estúpido',
  'retrasado',
  'débil',
  'fracaso',
];

export const validateLanguage = (message) => {
  const issues = [];
  const lowerMessage = message.toLowerCase();

  // Check for profanity
  const foundBadWords = badWords.filter(word => 
    lowerMessage.includes(word)
  );

  if (foundBadWords.length > 0) {
    issues.push({
      type: 'profanity',
      severity: 'high',
      message: 'Message contains inappropriate language',
    });
  }

  // Check for aggressive tone indicators
  const aggressivePatterns = [
    /!!!+/g, // Multiple exclamation marks
    /\?\?\?+/g, // Multiple question marks
    /[A-Z]{5,}/g, // All caps words
  ];

  aggressivePatterns.forEach(pattern => {
    if (pattern.test(message)) {
      issues.push({
        type: 'aggressive_tone',
        severity: 'medium',
        message: 'Message tone seems aggressive',
      });
    }
  });

  // Check for professional greeting
  const hasGreeting = /^(hola|buenos|buenas|estimado|señor|señora)/i.test(message);
  if (!hasGreeting && message.length > 20) {
    issues.push({
      type: 'missing_greeting',
      severity: 'low',
      message: 'Consider starting with a greeting',
    });
  }

  return {
    isValid: issues.filter(i => i.severity === 'high').length === 0,
    issues,
  };
};

export const flagMessage = (message, issues) => {
  return issues.some(i => i.severity === 'high');
};
