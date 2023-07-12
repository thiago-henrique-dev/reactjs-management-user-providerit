import React, { useRef, useState } from 'react';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/Firebase'

export default function ConfirmLogout() {
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
        style={{ fontSize: '16px'}}
        acceptClassName="p-button"
        acceptLabel="Sim"
        rejectClassName="p-button"
        rejectLabel="Não"
        accept={accept}
      />
      <div className="">
        <Button
          ref={buttonEl}
          onClick={() => setVisible(true)}
          label="Sair"
          style={{  background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))',
          color: 'white',
          width: '160px',
          height: '30px',
          fontWeight: 'bold',
          marginLeft: '120px'

        }}
        />
      </div>
    </>
  );
}
