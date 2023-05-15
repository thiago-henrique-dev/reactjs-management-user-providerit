import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api'
import { InputText } from "primereact/inputtext";
import { formatDateDialogEdit } from '../Dialog/DialogValidator';
import { db } from '../../services/Firebase'
import DialogEdit from '../Dialog/DialogEdit'
import CustomerDialog from "../Dialog/Dialog";
import ConfirmLogout from '../Buttons/ButtonLogout';
import ConfirmUserDelete from '../Buttons/ButtonDelete'
import {
  collection,
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore'
import "alertifyjs/build/css/alertify.min.css";
import alertify from "alertifyjs";

import './index.css'

export default function Table() {
  const [users, setUsers] = useState({ customers: [] });
  const [selectedRow, setSelectedRow] = useState({})
  const [customerDialogVisibleCreate, setCustomerDialogVisibleCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    birthdate: { value: null, matchMode: FilterMatchMode.CONTAINS },
    phone: { value: null, matchMode: FilterMatchMode.CONTAINS }
  })
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const [customerDialogVisible, setCustomerDialogVisible] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [form, setForm] = useState({
    id: '',
    name: '',
    phone: '',
    cpf: '',
    gender: '',
    birthdate: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value
    let _filters = { ...filters }
    _filters['global'].value = value
    setFilters(_filters)
    setGlobalFilterValue(value)
  }
  
  useEffect(() => {
    const loadUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const customers = snapshot.docs.map((doc) => {
        const customerData = doc.data();
        return {
          id: doc.id,
          ...customerData,
        };
      });
  
      setUsers(oldState => ({ ...oldState, customers }));
      setLoading(false);
    });
  
    return () => loadUsers();
  }, []);

  const handleCustomerDialogToggle = (customer) => {
    setCustomerToEdit(customer);
    if (customer) {
      const formattedBirthdate = formatDateDialogEdit(customer.birthdate);
      const [ano, mes, dia] = formattedBirthdate.split('-');
      const birthdateFormatted = `${ano}-${mes}-${dia}`;
  
      setForm({
        id: customer.id,
        userAdmin: customer.userAdmin,
        emailAdmin: customer.emailAdmin,
        name: customer.name,
        phone: customer.phone,
        cpf: customer.cpf,
        gender: customer.gender,
        otherGender: customer.otherGender,
        birthdate: birthdateFormatted,
        cep: customer.cep,
        street: customer.street,
        number: customer.number,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state,
        complement: customer.complement,
      });
    }
    setCustomerDialogVisible(!customerDialogVisible);
  };
  
  const handleUserDelete = async (user) => {
    const docRef = doc(db, 'users', user.id);
    try {
      await deleteDoc(docRef);
      console.log('Usuário excluído com sucesso:', user);
      alertify.success("Usuario excluido com sucesso!", { id: 'alertify-notifier' });

    } catch (error) {
      console.error('Erro ao excluir o usuário:', error);
    }
  };

  const handleCustomerDialogToggleCreate = () => {
    setCustomerDialogVisibleCreate(!customerDialogVisibleCreate);
  };

  const header = (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="p-input-icon-left" style={{ marginRight: '1rem' }}>
          <i className="pi pi-search" style={{ marginLeft: '12px' }} />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Pesquisar "
            style={{ width: '380px', height: '40px', marginLeft: '0.5rem' }}
          />
        </span>
        <div>
          <Button
            label="Cadastrar Usuário"
            icon="pi pi-external-link"
            style={{
              background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))',
              fontWeight: 'bold',
              height: '40px',
              minWidth: '150px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'}}
            onClick={handleCustomerDialogToggleCreate}/>
          <CustomerDialog
            visible={customerDialogVisibleCreate}
            onHide={handleCustomerDialogToggleCreate}/>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '50%' }}>
          <p style={{ fontSize: '11px', color: 'black', fontWeight: 'bold', marginTop: '5px' }}>Usuario da tabela selecionado</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ fontSize: '14px', color: 'black', fontWeight: 'bold', marginBottom: '10px' }} htmlFor="birthdate">Nome</label>
            <InputText
              id="name"
              className="p-inputtext"
              style={{ width: '310px', height: '40px' }}
              value={selectedRow?.name || ''}
              onChange={(e) => setSelectedRow({ ...selectedRow, name: e.target.value })}
              disabled/>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '14px', color: 'black', fontWeight: 'bold', marginBottom: '10px' }} htmlFor="birthdate">Data de nascimento</label>
          <InputText
            id="birthdate"
            className="p-inputtext"
            style={{ width: '365px', height: '40px' }}
            value={selectedRow?.birthdate || ''}
            onChange={(e) => setSelectedRow({ ...selectedRow, birthdate: e.target.value })}
            disabled/>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="card">
        <DataTable
          value={users.customers}
          onSelectionChange={(e) => setSelectedRow(e.value)}
          selectionMode="single"
          selection={selectedRow}
          paginator
          rows={3}
          dataKey="id"
          showGridlines
          metaKeySelection={false}
          rowClassName={'justify-content-center'}
          resizableColumns
          filters={filters}
          filterDisplay="row"
          loading={loading}
          globalFilterFields={['name']}
          header={header}
          emptyMessage="No customers found."
          className="custom-datatable">
          <Column
            field="name"
            header="Nome"
            filterPlaceholder="Nome"
            filter
            sortable
            style={{
              minWidth: '12rem',
              background: '',
              color: 'black'}}/>
          <Column
            field="birthdate"
            header="Data de nascimento"
            filterField="birthdate"
            filterPlaceholder="Data"
            dateType="date"
            sortable
            filter
            style={{
              minWidth: '12rem',
              background: '',
              color: 'black'}}/>
          <Column
            field="phone"
            header="Telefone"
            filterField="phone"
            sortable
            filter
            filterPlaceholder="Telefone"
            style={{
              minWidth: '12rem',
              background: '',
              color: 'black'}}/>
          <Column
            field="Ações"
            header="Ações"
            sortable
            style={{
              minWidth: '12rem',
              background: '',
              color: 'black'}}
            body={(rowData) => (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                icon="pi pi-pencil"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  background: 'linear-gradient(45deg, rgb(92, 15, 221), rgb(105, 28, 237))',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'}}
                onClick={() => handleCustomerDialogToggle(rowData)}
                tooltip="Editar"/>
              <ConfirmUserDelete
                handleUserDelete={handleUserDelete}
                rowData={rowData}/>
            </div>
            )}
          />
        </DataTable>
      </div>
      <div style={{ marginTop: '1rem' }}>
        {customerToEdit && (
          <DialogEdit
            visible={customerDialogVisible}
            onHide={handleCustomerDialogToggle}
            form={form}
            setForm={setForm}/>)}
      </div>
      <div style={{ marginTop: '1rem' }}>
        <ConfirmLogout />
      </div>
    </div>
  );
}                        