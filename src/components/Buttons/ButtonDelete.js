import React, { useRef, useState } from 'react';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

export default function ConfirmUserDelete(props) {
  const { handleUserDelete, rowData } = props;
  const [visible, setVisible] = useState(false);
  const toast = useRef(null);
  const buttonEl = useRef(null);

  const accept = async () => {
    await handleUserDelete(rowData);
  };

  return (
    <>
      <Toast ref={toast} />
      <Button
        ref={buttonEl}
        icon="pi pi-trash"
        style={{
          background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))',
        }}
        onClick={() => setVisible(true)}
        tooltip="Excluir"
        tooltipOptions={{ position: 'left' }}
      />
      <ConfirmPopup
        target={buttonEl.current}
        visible={visible}
        onHide={() => setVisible(false)}
        message="Deseja realmente excluir o usuário?"
        acceptClassName="p-button"
        acceptLabel="Sim"
        rejectClassName="p-button"
        rejectLabel="Não"
        accept={accept}
      />
    </>
  );
}
