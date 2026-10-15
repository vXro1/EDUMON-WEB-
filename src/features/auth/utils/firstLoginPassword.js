let loginPassword = null;

export const stashLoginPassword = (password) => {
  loginPassword = password || null;
};

export const readLoginPassword = () => loginPassword;

export const clearLoginPassword = () => {
  loginPassword = null;
};
