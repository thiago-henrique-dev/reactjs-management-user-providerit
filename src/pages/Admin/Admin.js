
import React from 'react';
import Table from '../../components/Table/Table';

export default function Admin() {
  const detailUserString = localStorage.getItem('detailUser');
  const detailUser = JSON.parse(detailUserString);
  const nome = detailUser.name;

  return (
    <>
    <p style={{ fontSize: '22px', marginLeft: '200px', fontWeight: 'bold' }}>
      Olá <span style={{ color: 'blue' }}>{nome}</span>! Seja bem-vindo!
    </p>   
      <Table />
    </>
  );
}

