// utils/firebaseUtils.js
export const getDocumentId = () => {
    return localStorage.getItem('userDocumentId');
  };
  
export const setDocumentId = (id) => {
    localStorage.setItem('userDocumentId', id);
};
  