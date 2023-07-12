import React from 'react';
import Table from '../../components/Table/Table';
import './Admin.css';

export default function Admin() {
  const detailUserString = localStorage.getItem('detailUser');
  const detailUser = JSON.parse(detailUserString);
  const nome = detailUser.name;

  return (
    <div className="admin-container">
      <p className="welcome-message">
        Olá <span className="username">{nome}!</span> Seja bem-vindo ao sistema de clientes da <span className='username'>Provider IT!</span>
      </p>   
      <Table />
    </div>
  );
}
