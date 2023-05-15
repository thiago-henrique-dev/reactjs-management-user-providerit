import React, { useRef, useState } from 'react';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/Firebase'

export default function ConfirmLogout(props) {
  const [visible, setVisible] = useState(false);
  const toast = useRef(null);
  const buttonEl = useRef(null);

  const accept = async () => {
    await handleLogout();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('detailUser');
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <>
      <Toast ref={toast} />
      <ConfirmPopup
        target={buttonEl.current}
        visible={visible}
        onHide={() => setVisible(false)}
        message="Deseja realmente sair?"
        icon="pi pi-exclamation-triangle"
        style={{     boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', color: 'black', 
        backgroundColor: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))',
        minWidth: '12rem', background: '#f8f9fa' }}
        acceptClassName="p-button"
        acceptLabel="Sim"
        rejectClassName="p-button"
        accept={accept}
      />
      <div className="card flex justify-content-center">
        <Button
          ref={buttonEl}
          onClick={() => setVisible(true)}
          label="Sair"
          style={{  background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))',
          color: 'white',
          width: '120px',
          height: '30px',
          fontWeight: 'bold',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'
        }}
        />
      </div>
    </>
  );
}
