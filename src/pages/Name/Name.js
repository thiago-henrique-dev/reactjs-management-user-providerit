import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/Firebase';
import { addDoc, collection } from 'firebase/firestore';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import './index.css';

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

    const { uid, email } = detailUser; // Extrair uid e email do objeto

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
    <div className="info-user" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ marginBottom: '100px' }}>
        <h1>Qual é seu nome?</h1>
        <form onSubmit={handleSubmit}>
          <InputText type="text" 
                value={name} 
                onChange={handleNomeChange} 
                style={{ marginBottom: '10px' }} />
          <Button
            type="submit"
            onClick={handleConfirmation}
            style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))', marginBottom: '10px', marginLeft: '15px' }}
          >
            <span style={{ margin: 'auto' }}>✔</span>
          </Button>
          {showSaveButton && (
            <div>
              <Button style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))', width: '100%', maxWidth: '280px' }}>
                <span style={{ margin: 'auto' }}>Prosseguir</span>
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Formulario;
