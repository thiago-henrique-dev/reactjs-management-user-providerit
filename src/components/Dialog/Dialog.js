import { useState } from 'react'
import { db } from '../../services/Firebase'
import { addDoc, collection } from 'firebase/firestore'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { RadioButton } from 'primereact/radiobutton'
import axios from 'axios';
import alertify from "alertifyjs";
import { formatPhone, 
    formatCPF, 
    validateCPF, 
    formatDatePTBR, 
    formatCEP, 
    errorMessages } from './DialogValidator';
import "alertifyjs/build/css/alertify.min.css";
import './index.css'

export default function CustomerDialog(props) {
    const storedData = JSON.parse(localStorage.getItem("detailUser"));
    const [form, setForm] = useState({
        userAdmin: '',
        emailAdmin: '',
        name: '',
        phone: '',
        cpf: '',
        gender: '',
        otherGender: '',
        birthdate: '',
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: '',
    });

    const [formFocused, setFormFocused] = useState({
        name: false,
        phone: false,
        cpf: false,
        gender: false,
        birthdate: false,
        otherGender: false,
        cep: false,
        street: false,
        number: false,
        neighborhood: false,
        city: false,
        state: false,
        complement: false,
    });

    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isPhoneValid, setIsPhoneValid] = useState(true);
    const [isCPFValid, setIsCPFValid] = useState(true);
    const [isCEPValid, setIsCEPValid] = useState(false);
    const [showCEPError, setShowCEPError] = useState(false);
    const [showOtherInput, setShowOtherInput] = useState(false);

    const handleFieldFocus = (fieldName) => {
        setFormFocused({ ...formFocused, [fieldName]: true });
    };

    const handleFieldBlur = (fieldName) => {
        setFormFocused((prevFormFocused) => ({
            ...prevFormFocused,
            [fieldName]: false,
        }));
    };

    function handleChange(e) {
        const { name, value } = e.target;

        if (name === 'gender') {
            if (value === 'Outro') {
                setShowOtherInput(true);
                setForm((oldValues) => ({
                    ...oldValues,
                    gender: value,
                    otherGender: oldValues.otherGender || '', 
                }));
            } else {
                setShowOtherInput(false);
                setForm((oldValues) => ({
                    ...oldValues,
                    gender: value,
                    otherGender: '',
                }));
            }
        } else if (name === 'phone') {
            const formatValue = formatPhone(value);
            const isValid = formatValue.length === 15;

            setForm((oldValues) => ({
                ...oldValues,
                [name]: formatValue,
            }));
            setIsPhoneValid(isValid);
        } else if (name === 'cpf') {
            const formatValue = formatCPF(value);
            const isValid = validateCPF(value);

            setForm((oldValues) => ({
                ...oldValues,
                [name]: formatValue,
            }));
            setIsCPFValid(isValid);
        } else if (name === 'cep') {
            const formatValue = formatCEP(value);

            setForm((oldValues) => ({
                ...oldValues,
                [name]: formatValue,
            }));
        } else {
            setForm((oldValues) => ({
                ...oldValues,
                [name]: value,
            }));
        }
    }

    const resetForm = () => {
        setForm({
            name: '',
            phone: '',
            cpf: '',
            gender: '',
            otherGender: '',
            birthdate: '',
            cep: '',
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            complement: '',
        });
        setFormFocused({
            name: false,
            email: false,
            message: false,
        });
        props.onHide()
        setFormSubmitted(false);
        setIsPhoneValid(true)
        setIsCEPValid(false)
        setShowCEPError(false)
        setIsCPFValid(false)
        setShowOtherInput(false)
    };

    async function registerCustomer(e) {
        e.preventDefault();
        setFormSubmitted(true);

        const isValidCPF = validateCPF(form.cpf);
        if (!isValidCPF) {
            setIsCPFValid(false);
            return;
        }

        try {
            const formattedBirthdate = formatDatePTBR(form.birthdate);
            const customerInfo = {
                userAdmin: storedData.name,
                emailAdmin: storedData.email,
                name: form.name,
                phone: form.phone,
                cpf: form.cpf,
                gender: form.gender,
                otherGender: form.otherGender,
                birthdate: formattedBirthdate,
                cep: form.cep,
                street: form.street,
                number: form.number,
                neighborhood: form.neighborhood,
                city: form.city,
                state: form.state,
                complement: form.complement,
            };

            if (!form.cep || !form.street || !form.number || !form.neighborhood || !form.city || !form.state || !form.complement) {
                return;
            }
            await addDoc(collection(db, 'users'), customerInfo);
            alertify.success("Usuário cadastrado com sucesso!", { id: 'alertify-notifier' });
            resetForm()
        } catch (error) {
            console.error('Campos em branco:', error);
            alertify.error("Erro ao cadastrar usuário:", error, { id: 'alertify-notifier' });
        }
    }

    const handleSearch = async () => {
        if (form.cep.length !== 9) {
            setIsCEPValid(false);
            setShowCEPError(true);
            return;
        }
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${form.cep}/json/`);

            if (response.data.erro) {
                setIsCEPValid(false);
                setShowCEPError(true);
                return;
            }
            setForm({
                ...form,
                street: response.data.logradouro,
                neighborhood: response.data.bairro,
                city: response.data.localidade,
                state: response.data.uf,
            });
            setIsCEPValid(true);
            setShowCEPError(false);
        } catch (error) {
            console.error(error);
            setForm({
                ...form,
                street: '',
                neighborhood: '',
                city: '',
                state: '',
            });
            setIsCEPValid(false);
            setShowCEPError(true);
        }
    };

    return (
        <Dialog visible={props.visible} onHide={resetForm}>
            <form onSubmit={registerCustomer}  style={{ overflow: 'hidden'}}
                className="form__registration">
                <h1 className='form__title'>Ficha Cadastral</h1>
                <h1 className='form__address'>Dados do cliente</h1>

                <div className="input-group">
                    <div style={{ display: 'flex' }}>
                        <div>
                        <span className="p-float-label">
                            <InputText
                                id="inputText"
                                name="name"
                                style={{ width: '240px',
                                    marginRight: '5px',
                                    border: formSubmitted && 
                                                        form.name === '' ? 
                                                        '1px solid red' : '1px solid #ccc'}}
                                value={form.name}
                                onChange={handleChange}
                                onFocus={() => handleFieldFocus('name')}
                                onBlur={() => handleFieldBlur('name')}/>
                            <label style={{ fontWeight: 'bold'}}>Nome</label>
                          </span>
                          {formSubmitted && form.name === '' && !formFocused.name && (
                                <div style={{ fontSize: '11px', color: 'red', transition: 'color 0.2s ease-in-out', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.name}
                                </div>)}
                        </div>
                        <div className="form__group">
                        <span className="p-float-label">
                            <InputText
                                id="inputText"
                                name="phone"
                                style={{ width: '170px',
                                    marginRight: '5px',
                                    border: formSubmitted
                                                    && form.phone === '' ? 
                                                        '1px solid red' : '1px solid #ccc'}}
                                value={form.phone}
                                maxLength="15"
                                onChange={handleChange}
                                onFocus={() => handleFieldFocus('phone')}
                                onBlur={() => handleFieldBlur('phone')}/>
                                <label style={{ fontWeight: 'bold'}}>Telefone</label>
                            </span>
                            { formSubmitted && form.phone === '' && !formFocused.phone && (
                                <div style={{ fontSize: '11px', color: 'red', transition: 'color 0.2s ease-in-out', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.phone}
                                </div>)}
                            {!formFocused.phone && !isPhoneValid && (
                                <div style={{ fontSize: '10px', color: 'red', 
                                                fontWeight: 'bold', marginTop: '5px' }}>
                                    Número de telefone inválido
                                </div>)}
                        </div>
                        <div className="form__group">
                         <span className="p-float-label">
                            <InputText
                                id="inputText"
                                name="cpf"
                                style={{ width: '210px',
                                    marginRight: '5px',
                                    border: formSubmitted && form.cpf === '' ? 
                                                    '1px solid red' : '1px solid #ccc'}}
                                value={form.cpf}
                                maxLength="14"
                                onChange={handleChange}
                                onFocus={() => handleFieldFocus('cpf')}
                                onBlur={() => handleFieldBlur('cpf')}/>
                             <label style={{ fontWeight: 'bold'}}>CPF</label>
                            </span>
                            {formSubmitted && form.cpf === '' && !formFocused.cpf && (
                                <div style={{ marginLeft: '15px', fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.cpf}
                                </div>
                            )}
                            {!formFocused.cpf && form.cpf.length > 0 && (
                                <div style={{ fontSize: '11px', transition: 'color 0.2s ease-in-out', fontWeight: 'bold', marginTop: '5px' }}>
                                    {!isCPFValid && (
                                        <span style={{ fontSize: '11px', color: 'red', fontWeight: 'bold' }}>
                                            CPF inválido.
                                        </span>)}
                                    {isCPFValid && (
                                        <span style={{ marginLeft: '15px', fontSize: '11px', color: 'green', fontWeight: 'bold' }}>
                                            CPF válido.
                                        </span>)}
                                </div>)}
                        </div>
                    </div>
                    <div className="form__group" style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="flex-1">
                            <h1 className='form__address'>Genero</h1>
                            <div style={{ display: 'flex' }}>
                                <RadioButton
                                    inputId="gender1"
                                    name="gender"
                                    value="Masculino"
                                    onChange={handleChange}
                                    onBlur={() => handleFieldBlur('gender')}
                                    onFocus={() => handleFieldFocus('gender')}
                                    checked={form.gender === 'Masculino'}                                />
                                <label style={{ fontSize: '14px', fontWeight: 'bold', marginLeft: '10px', marginRight: '5px' }}>Masculino</label>
                                <RadioButton
                                    inputId="gender2"
                                    name="gender"
                                    value="Feminino"
                                    onChange={handleChange}
                                    onBlur={() => handleFieldBlur('gender')}
                                    onFocus={() => handleFieldFocus('gender')}
                                    checked={form.gender === 'Feminino'}/>
                                <label style={{ fontSize: '14px', fontWeight: 'bold', marginLeft: '10px', marginRight: '5px' }}>Feminino</label>
                                <RadioButton
                                    inputId="gender3"
                                    name="gender"
                                    value="Outro"
                                    onChange={handleChange}
                                    onBlur={() => handleFieldBlur('gender')}
                                    onFocus={() => handleFieldFocus('gender')}
                                    checked={form.otherGender === 'Outro'}/>
                                <label htmlFor="gender3" style={{ fontSize: '14px', fontWeight: 'bold', marginLeft: '10px', marginRight: '10px' }}>Personalizado</label>
                                {showOtherInput && (
                                    <div>
                                        <span className="p-float-label">
                                        <InputText
                                            type="text"
                                            name="otherGender"
                                            value={form.otherGender}
                                            onChange={handleChange}
                                            onBlur={handleFieldBlur}
                                            style={{ width: '130px' }}/>
                                        <label style={{ fontWeight: 'bold'}}>Gênero</label>
                                        </span>
                                    </div>)}
                            </div>
                            {formSubmitted && form.gender === '' 
                                        && !formFocused.otherGender && (
                                <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.gender}
                                </div>)}
                            </div>
                        <div>
                            <h1 className='form__address'>Data de nascimento</h1>
                            <InputText
                                id="birthdate"
                                name="birthdate"
                                style={{
                                    marginLeft: '5px', marginRight: '5px',
                                    border: formSubmitted && 
                                                    form.birthdate === '' ?
                                                         '1px solid red' : '1px solid #ccc'}}
                                type="date"
                                defaultValue={form.birthdate}
                                onChange={handleChange}
                                onFocus={() => handleFieldFocus('birthdate')}
                                onBlur={() => handleFieldBlur('birthdate')}/>
                                {formSubmitted && form.birthdate === '' 
                                        && !formFocused.birthdate && (
                                <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                    {errorMessages.birthdate}
                                </div>)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h1 className='form__address' style={{ fontSize: '14px', marginLeft: '320px'}}>Endereço</h1>
                        <div className="form__group">
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
                                <span className="p-float-label">
                                    <InputText
                                        id="inputText"
                                        name="cep"
                                        type="text"
                                        value={form.cep}
                                        onChange={handleChange}
                                        onFocus={() => handleFieldFocus('cep')}
                                        onBlur={() => handleFieldBlur('cep')}
                                        style={{
                                            width: '150px', marginRight: '5px',
                                            border: formSubmitted && form.cep === '' ? '1px solid red' : '1px solid #ccc',
                                        }}/>
                                    <label style={{ fontWeight: 'bold'}}>CEP</label>
                                    </span>
                                    {formSubmitted && form.cep === '' && !formFocused.cep && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.cep}
                                        </div>)}
                                 </div>
                                <div>
                                <Button
                                    type="button"
                                    className="pi pi-search"
                                    onClick={handleSearch}
                                    style={{
                                        background: 'linear-gradient(45deg,#6610F2,#741FFF)',
                                        color: 'white',
                                        width: '50px',
                                        height: '35px',
                                        fontWeight: 'bold',
                                        marginTop: '5px'}}/>
                                 {showCEPError && 
                                        !isCEPValid && (
                                    <div style={{ marginTop: '5px', fontSize: '11px', color: 'red', fontWeight: 'bold' }}>
                                        CEP inválido ou não foi encotrado!
                                    </div>)}
                                {!showCEPError && isCEPValid && (
                                    <div style={{ marginTop: '5px', fontSize: '11px', color: 'green', fontWeight: 'bold' }}>
                                        CEP Encontrado.
                                    </div>)}
                                </div>
                            </div>
                        </div>
                        <div className="form__group">
                            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '5px' }}>
                                <div style={{ marginRight: '5px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="street"
                                            type="text"
                                            value={form.street}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('street')}
                                            onBlur={() => handleFieldBlur('street')}
                                            style={{ width: '320px',
                                                marginRight: '5px',
                                                border: 
                                                    formSubmitted &&
                                                         form.street === '' ? 
                                                                '1px solid red' : '1px solid #ccc'}} />
                                        <label style={{ fontWeight: 'bold' }} >Rua</label>
                                    </span>
                                    {formSubmitted &&
                                        form.street === '' &&
                                        !formFocused.street && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.street}
                                            </div>)}
                                </div>
                                <div style={{ marginRight: '5px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="number"
                                            type="text"
                                            placeholder="Número"
                                            value={form.number}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('number')}
                                            onBlur={() => handleFieldBlur('number')}
                                            style={{ width: '110px',
                                                marginRight: '5px',
                                                border: formSubmitted &&
                                                            form.number === '' ?
                                                    '1px solid red' : '1px solid #ccc'}} />
                                        <label style={{ fontWeight: 'bold' }} >Número</label>
                                    </span>
                                    {formSubmitted &&
                                        form.number === '' &&
                                        !formFocused.number && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.number}
                                            </div>)}
                                </div>
                                <div>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="neighborhood"
                                            type="text"
                                            placeholder="Bairro"
                                            value={form.neighborhood}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('neighborhood')}
                                            onBlur={() => handleFieldBlur('neighborhood')}
                                            style={{
                                                width: '190px',
                                                marginRight: '5px',
                                                border: formSubmitted &&
                                                    form.neighborhood === '' ?
                                                    '1px solid red' : '1px solid #ccc'}} />
                                        <label style={{ fontWeight: 'bold' }} >Bairro</label>
                                    </span>
                                    {formSubmitted &&
                                        form.neighborhood === '' &&
                                        !formFocused.neighborhood && (
                                            <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                                {errorMessages.neighborhood}
                                            </div>)}
                                </div>
                            </div>
                        </div>
                        <div className="form__group">
                            <div style={{ display: 'flex' }}>
                                <div style={{ marginRight: '10px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="city"
                                            type="text"
                                            placeholder="Cidade"
                                            value={form.city}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('city')}
                                            onBlur={() => handleFieldBlur('city')}
                                            style={{ width: '120px', 
                                                border: formSubmitted && form.city === '' ? '1px solid red' : '1px solid #ccc'}}/>
                                        <label style={{ fontWeight: 'bold' }}>Cidade</label>
                                    </span>
                                    {formSubmitted && form.city === '' && !formFocused.city && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.city}
                                        </div>)}
                                </div>
                                <div style={{ marginRight: '10px' }}>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="state"
                                            type="text"
                                            placeholder="Estado"
                                            value={form.state}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('state')}
                                            onBlur={() => handleFieldBlur('state')}
                                            style={{
                                                width: '120px',
                                                border: formSubmitted && 
                                                            form.state === '' ? 
                                                                '1px solid red' : '1px solid #ccc'}}/>
                                        <label style={{ fontWeight: 'bold' }}>Estado</label>
                                    </span>
                                    {formSubmitted && form.state === '' && !formFocused.state && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.state}
                                        </div>)}
                                </div>
                                <div>
                                    <span className="p-float-label">
                                        <InputText
                                            id="inputText"
                                            name="complement"
                                            type="text"
                                            value={form.complement}
                                            onChange={handleChange}
                                            onFocus={() => handleFieldFocus('complement')}
                                            onBlur={() => handleFieldBlur('complement')}
                                            style={{
                                                width: '380px',
                                                border:formSubmitted && 
                                                    form.complement === '' ? 
                                                        '1px solid red' : '1px solid #ccc'}}/>
                                        <label style={{ fontWeight: 'bold' }}>Complemento</label>
                                    </span>
                                    {formSubmitted && form.complement === '' && !formFocused.complement && (
                                        <div style={{ fontSize: '11px', color: 'red', fontWeight: 'bold', marginTop: '5px' }}>
                                            {errorMessages.complement}
                                        </div>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Button type="submit"
                    label="Enviar"
                    style={{
                        background: 'linear-gradient(45deg,#6610F2,#741FFF)',
                        color: 'white',
                        width: '80px',
                        height: '40px',
                        fontWeight: 'bold',
                        marginBottom: '80px',
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)'}}/>
            </form>
        </Dialog >
    )
}