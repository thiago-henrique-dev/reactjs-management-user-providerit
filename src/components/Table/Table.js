import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { FilterMatchMode } from 'primereact/api'
import { InputText } from "primereact/inputtext";
import { formatDateDialogEdit } from '../Dialog/Validation/DialogValidator';
import api from '../../services/apiURL'
import DialogEdit from '../../components/Dialog/DialogEdit/DialogEdit'
import CustomerDialog from "../../components/Dialog/Dialog/Dialog";
import ConfirmLogout from '../Buttons/ButtonLogout';
import ConfirmUserDelete from '../Buttons/ButtonDelete'
import "alertifyjs/build/css/alertify.min.css";
import alertify from "alertifyjs";
import axios from 'axios';
import './Table.css'

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
  const fetchUsers = async () => {
    try {
      const response = await api.get('/clientes/list');
      const responseData = response.data;

      const customers = [];
      for (let i = 0; i < responseData.length; i++) {
        const customer = responseData[i];
        const { id, ...customerData } = customer;
        customers.push({ id, ...customerData });
      }

      console.log(customers);
      setUsers((oldState) => ({ ...oldState, customers }));
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar os usuários:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    return () => {
    };
  }, []);


  const handleCustomerDialogToggle = (customer) => {
    setCustomerToEdit(customer);
    if (customer) {
      const formattedBirthdate = formatDateDialogEdit(customer.birthdate);
      const [ano, mes, dia] = formattedBirthdate.split('-');
      const birthdateFormatted = `${ano}-${dia}-${mes}`;

      setForm({
        id: customer.id,
        nameAdmin: customer.nameAdmin,
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
    try {
      await api.delete(`/clientes/${user.id}`);
      alertify.success('Usuário excluído com sucesso!', { id: 'alertify-notifier' });
      setTimeout(() => {
        fetchUsers();
      }, 500);
    } catch (error) {
      console.error('Erro ao excluir o usuário:', error);
    }
  };

  const handleCustomerDialogToggleCreate = () => {
    setCustomerDialogVisibleCreate(!customerDialogVisibleCreate);
  };

  const header = (
    <div>
      <div className="search-bar">
        <span className="p-input-icon-left search-icon">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Pesquisar "
            className="input-search"
          />
        </span>
        <div>
          <Button
            label="Cadastrar Usuário"
            icon="pi pi-external-link"
            className="add-user-button"
            style={{ background: 'linear-gradient(45deg, #5C0FDD, #691CEC)', fontWeight: '600' }}
            onClick={handleCustomerDialogToggleCreate}
          />
          <CustomerDialog
            visible={customerDialogVisibleCreate}
            onHide={handleCustomerDialogToggleCreate}
            className="user-dialog"
            fetchUsers={fetchUsers}
          />
        </div>
      </div>
      <div className="user-details-container">
        <div className="user-info">
          <p className="user-info-label">Usuário da tabela selecionado</p>
          <div className="user-info-input">
            <div className="input-wrapper">
              <label className="user-info-input-label" htmlFor="name">Nome</label>
              <InputText
                id="name"
                className="p-inputtext user-info-input-text"
                value={selectedRow?.name || ''}
                onChange={(e) => setSelectedRow({ ...selectedRow, name: e.target.value })}
                disabled
              />
            </div>
          </div>
        </div>
        <div className="user-info">
          <div className="input-wrapper">
            <label className="user-info-input-label" htmlFor="birthdate">Data de nascimento</label>
            <InputText
              id="birthdate"
              className="p-inputtext user-info-birthdate"
              value={selectedRow?.birthdate || ''}
              onChange={(e) => setSelectedRow({ ...selectedRow, birthdate: e.target.value })}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className='content-wrapper'>
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
            className="name-column"
          />
          <Column
            field="birthdate"
            header="Data de nascimento"
            filterField="birthdate"
            filterPlaceholder="Data"
            dateType="date"
            sortable
            filter
            className="birthdate-column"
          />
          <Column
            field="phone"
            header="Telefone"
            filterField="phone"
            sortable
            filter
            filterPlaceholder="Telefone"
            className="phone-column"
          />
          <Column
            field="Ações"
            header="Ações"
            sortable
            className="actions-column"
            body={(rowData) => (
              <div className="actions-container">
                <div className="actions-wrapper">
                  <Button
                    icon="pi pi-pencil"
                    className="edit-button"
                    style={{ background: 'linear-gradient(45deg, #5C0FDD, #691CEC)' }}
                    onClick={() => handleCustomerDialogToggle(rowData)}
                    tooltip="Editar"
                  />
                  <ConfirmUserDelete
                    handleUserDelete={handleUserDelete}
                    rowData={rowData}
                  />
                </div>
              </div>
            )}
          />
        </DataTable>
      </div>
      <div className='actions-container'>
        {customerToEdit && (
          <DialogEdit
            visible={customerDialogVisible}
            onHide={handleCustomerDialogToggle}
            form={form}
            fetchUsers={fetchUsers}
            setForm={setForm} />)}
      </div>
      <div>
        <ConfirmLogout />
      </div>
    </div>
  );
}                        