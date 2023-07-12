import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/Firebase';
import { addDoc, collection } from 'firebase/firestore';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import './Name.css';

const Formulario = () => {
  const [name, setName] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);

  const handleConfirmation = (event) => {
    event.preventDefault();
    setShowSaveButton((prev) => !prev);

    const detailUserString = localStorage.getItem('detailUser');
    const detailUser = JSON.parse(detailUserString);

    localStorage.setItem('detailUser', JSON.stringify({ ...detailUser, name }));
  };

  const handleNomeChange = (event) => {
    setName(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const detailUserString = localStorage.getItem('detailUser');
    const detailUser = JSON.parse(detailUserString);

    const { uid, email } = detailUser;

    const customerInfo = {
      uid: uid,
      email: email,
      name: name,
    };

    try {
      await addDoc(collection(db, 'admin'), customerInfo);
      console.log('Dados salvos com sucesso no Firestore!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao salvar os dados:', error);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="info-user">
        <h1>Qual é seu nome?</h1>
        <form onSubmit={handleSubmit}>
          <InputText
            type="text"
            value={name}
            onChange={handleNomeChange}
            className="input-text"
          />
          <Button
            type="submit"
            onClick={handleConfirmation}
            className="button"
            style={{ background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))'}}
          >
            <span>✔</span>
          </Button>
          {showSaveButton && (
            <div>
              <Button
                className="save-button"
                style={{ background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))'}}>
                <span>Prosseguir</span>
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
  
};

export default Formulario;
