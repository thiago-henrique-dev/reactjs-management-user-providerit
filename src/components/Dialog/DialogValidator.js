export function formatDatePTBR(dateString) {
  const [year, month, day] = dateString.split('-');
  const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  return formattedDate;
}

export function formatDateDialogEdit(data) {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = String(dataObj.getFullYear());

  return `${ano}-${dia}-${mes}`;
}

export function formatPhone(phone) {
  const cleanedValue = phone.replace(/\D/g, '');

  if (cleanedValue.length >= 2) {
    let formattedValue = `(${cleanedValue.slice(0, 2)})`;

    if (cleanedValue.length >= 3) {
      formattedValue += ` ${cleanedValue.slice(2, 7)}`;

      if (cleanedValue.length >= 8) {
        formattedValue += `-${cleanedValue.slice(7, 15)}`;
      }
    }

    return formattedValue;
  }

  return cleanedValue;
}

export function formatCPF(cpf) {
  const cleanedValue = cpf.replace(/\D/g, '');

  if (cleanedValue.length <= 3) {
    return cleanedValue;
  } else if (cleanedValue.length <= 6) {
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
  } else if (cleanedValue.length <= 9) {
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
  } else if (cleanedValue.length <= 11) {
    return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9)}`;
  } else {
    return cleanedValue.slice(0, 14);
  }
}

export function validateCPF(cpf) {
      cpf = cpf.replace(/[^\d]+/g, '');

      if (cpf === '') return false;
      if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

      let sum = 0;
      let remainder;

      for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(9, 10))) return false;

      sum = 0;
      for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.substring(10, 11))) return false;

      return true;
}

export function formatCEP(cep) {
  const cleanedValue = cep.replace(/\D/g, '');

  if (cleanedValue.length >= 6) {
    return `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5, 8)}`;
  }

  return cleanedValue;
}

export const errorMessages = {
  name: 'Nome é obrigatório!',
  phone: 'Telefone é obrigatório!',
  cpf: ' CPF é obrigatório',
  gender: 'Gẽnero é obrigatório!',
  birthdate: 'Data de nascimimento é obrigatório!',
  cep: ' CEP é obrigatório!',
  street: 'Rua é obrigatório!',
  number: 'Número é obrigatório!',
  neighborhood: 'Bairro é obrigatório!',
  city: 'Cidade é obrigatório!',
  state: 'Estado é obrogatório!',
  complement: 'Complemento é obrigatório!',
};

