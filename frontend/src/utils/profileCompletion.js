export const getProfileCompletion = (user) => {
  if (!user) return { percentage: 0, missingFields: [], completedFields: [] };

  const fields = [
    { key: 'fullName', label: 'Full Name', value: user.fullName },
    { key: 'email', label: 'Email', value: user.email },
    { key: 'cgpa', label: 'CGPA / Academic Score', value: user.cgpa },
    { key: 'degreeLevel', label: 'Degree Level', value: user.degreeLevel },
    { key: 'major', label: 'Field of Study / Major', value: user.major },
    { key: 'preferredCountry', label: 'Preferred Country', value: user.preferredCountry },
  ];

  const completedFields = fields.filter(f => f.value && String(f.value).trim() !== '');
  const missingFields = fields.filter(f => !f.value || String(f.value).trim() === '');
  const percentage = Math.round((completedFields.length / fields.length) * 100);

  return { percentage, missingFields, completedFields, fields };
};

export const shouldShowProfilePrompt = (user) => {
  const { percentage } = getProfileCompletion(user);
  const shownThisSession = sessionStorage.getItem('profilePromptShown');
  const justLoggedIn = sessionStorage.getItem('justLoggedIn');
  return percentage < 100 && !shownThisSession && justLoggedIn === 'true';
};

export const markProfilePromptShown = () => {
  sessionStorage.setItem('profilePromptShown', 'true');
  sessionStorage.removeItem('justLoggedIn');
};
