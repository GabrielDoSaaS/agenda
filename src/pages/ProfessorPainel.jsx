import React, { useState, useEffect } from "react";
import axios from "axios";

// ====================================================================
// 1. Definição da URL da API (ATENÇÃO: Substitua pelo seu endereço real)
// ====================================================================
const API_URL = 'https://backendagenda-paf6.onrender.com'; // Exemplo de URL. Ajuste conforme seu backend.

// Função auxiliar para converter File para Base64 (Data URL)
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// ====================================================================
// CONSTANTES DE MODO: Para gerenciar a navegação e o CRUD
// ====================================================================
const SECTION_MODES = {
    AGENDAMENTOS: 'agendamentos',
    PRODUTOS: 'produtos',
    PROFESSORES: 'professores',
    VENDAS: 'vendas',
    AGENDA: 'agenda',
    PACOTES: 'pacotes', 
};

const CRUD_MODES = {
    LIST: 'list',
    ADD: 'add',
    EDIT: 'edit',
};

// CONSTANTES DA NOVA AGENDA
const AGENDA_CONFIG_MODES = {
    PADRAO_SEMANAL: 'padrao_semanal',
    DISPONIBILIDADE_MENSAL: 'disponibilidade_mensal',
    DATAS_ESPECIFICAS: 'datas_especificas',
};

// Array de meses para uso no dropdown
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ====================================================================
// COMPONENTE: LoginScreen (Mantido)
// ====================================================================
const LoginScreen = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            onLoginSuccess(response.data.user);

        } catch (err) {
            console.error("Erro de login:", err.response?.data || err);
            const errorMessage = err.response?.data?.error || 'Erro ao tentar fazer login. Verifique as credenciais e o console.';
            setError(errorMessage);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F9FBEE" }}>
            <div
                className="shadow-xl rounded-xl p-8 w-full max-w-md border"
                style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}
            >
                <h1 className="text-3xl font-bold text-center mb-6" style={{ color: "#201E1E" }}>
                    Acesso ao Painel
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>E-mail</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150 ease-in-out transform hover:scale-[1.01]"
                        style={{
                            backgroundColor: isLoading ? "#A9CBD2" : "#9AC3CD",
                            color: "#201E1E",
                            cursor: isLoading ? "not-allowed" : "pointer"
                        }}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ====================================================================
// COMPONENTE: Galeria de Imagens para um único produto (Mantido)
// ====================================================================
const ProductImageGallery = ({ images, nameProduct }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="h-48 flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Sem Imagem</p>
            </div>
        );
    }

    const totalImages = images.length;
    const currentImageSrc = images[currentImageIndex];

    const goToNext = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const goToPrev = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    };

    const showNavigation = totalImages > 1;

    return (
        <div className="relative h-48 overflow-hidden">
            <img
                src={currentImageSrc}
                alt={`Imagem ${currentImageIndex + 1} de ${totalImages} do produto ${nameProduct}`}
                className="w-full h-full object-cover transition duration-300"
            />

            {showNavigation && (
                <>
                    <button
                        onClick={goToPrev}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                        &lt;
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                    >
                        &gt;
                    </button>

                    <div className="absolute bottom-2 left-0 right-0 text-center">
                        <span className="text-white text-xs bg-black bg-opacity-60 px-2 py-1 rounded">
                            {currentImageIndex + 1} / {totalImages}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};


const ProfessorPainel = () => {
  // ESTADOS DE AUTENTICAÇÃO E NAVEGAÇÃO
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [currentSection, setCurrentSection] = useState(SECTION_MODES.AGENDAMENTOS);

  // ESTADOS PARA PRODUTOS, PROFESSORES, AGENDA, VENDAS
  const [productCrudMode, setProductCrudMode] = useState(CRUD_MODES.LIST);
  const [produtos, setProdutos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productFormData, setProductFormData] = useState({
    nome: "", descricao: "", preco: "", imagens: [], repassarFrete: false, 
    // NOVOS CAMPOS DE ENVIO
    cepOrigem: "", 
    peso: "", // Em kg
    altura: "", // Em cm
    largura: "", // Em cm
    formato: "1", // 1: Caixa/Pacote, 2: Rolo/Cilindro, 3: Envelope - Usando o padrão Correios/Melhor Envio
  });

  const [professorCrudMode, setProfessorCrudMode] = useState(CRUD_MODES.LIST);
  const [professores, setProfessores] = useState([]);
  const [professorIsLoading, setProfessorIsLoading] = useState(false);
  const [editingProfessorId, setEditingProfessorId] = useState(null);
  // MODIFICADO: Substituído pricePerClass por specialties: []
  const [professorFormData, setProfessorFormData] = useState({
    name: "", description: "", email: "", password: "", specialties: [], picture: "", pix: "", 
  });

  const initialSchedule = [
      { day: 'Segunda-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Terça-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Quarta-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Quinta-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Sexta-feira', active: true, start: '09:00', end: '18:00' },
      { day: 'Sábado', active: false, start: '09:00', end: '13:00' },
      { day: 'Domingo', active: false, start: '09:00', end: '13:00' },
  ];
  const [scheduleFormData, setScheduleFormData] = useState(initialSchedule);
  const [scheduledClients, setScheduledClients] = useState([]);
  const [agendamentoIsLoading, setAgendamentoIsLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [salesIsLoading, setSalesIsLoading] = useState(false);
  
  // ESTADOS PARA PACOTES
  const [packageCreationMode, setPackageCreationMode] = useState(CRUD_MODES.LIST);
  const [selectedProfessorsForPackage, setSelectedProfessorsForPackage] = useState([]);
  const [packageFormData, setPackageFormData] = useState({
      packageName: "",    // Alterado de 'name'
      price: "",          // Alterado de 'totalValue'
      description: "",    // NOVO CAMPO
      professorClasses: {}, 
  });
  
  // NOVOS ESTADOS PARA O MODAL DE SUCESSO DO PACOTE
  const [showPackageSuccessModal, setShowPackageSuccessModal] = useState(false);
  const [packageSuccessMessage, setPackageSuccessMessage] = useState("");

  // NOVOS ESTADOS PARA AGENDA MAIS COMPLETA
  const [agendaConfigMode, setAgendaConfigMode] = useState(AGENDA_CONFIG_MODES.PADRAO_SEMANAL);
  const [monthlyAvailability, setMonthlyAvailability] = useState({}); // { '0': true, '1': false, ... } onde a chave é o índice do mês (0-11)
  const [specificDates, setSpecificDates] = useState([]); // [{ date: '2025-10-20', active: true, start: '10:00', end: '12:00' }]
  // FIM NOVOS ESTADOS PARA AGENDA MAIS COMPLETA

  
  useEffect(() => {
    if (user && Array.isArray(user.scheduledClients)) {
        setAgendamentoIsLoading(true);
        setScheduledClients(user.scheduledClients);
        setAgendamentoIsLoading(false);
    } else {
        setScheduledClients([]);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    // O usuário não-adm não deve carregar dados de Gerenciamento, apenas se for ADM ou se a seção for AGENDAMENTOS/AGENDA/VENDAS.
    // O bloco abaixo só deve rodar se o usuário for ADM OU se estiver em uma seção que também é permitida para não-ADMs.
    // Como a condição está baseada em currentSection, ela já é intrinsecamente segura, pois o não-ADM
    // não terá os botões para mudar para outras seções, mas o useEffect continuará rodando quando ele mudar de AGENDAMENTOS para AGENDA.

    if (currentSection === SECTION_MODES.PROFESSORES || currentSection === SECTION_MODES.PACOTES) {
        if (professorCrudMode === CRUD_MODES.LIST || currentSection === SECTION_MODES.PACOTES) {
            const loadProfessors = async () => {
                const fetchedProfessors = await fetchProfessors();
                setProfessores(fetchedProfessors);
            };
            loadProfessors();
        }
    }
    
    if (currentSection === SECTION_MODES.PRODUTOS && productCrudMode === CRUD_MODES.LIST) {
        const loadProducts = async () => {
            const fetchedProducts = await fetchProducts();
            setProdutos(fetchedProducts);
        };
        loadProducts();
    }
    if (currentSection === SECTION_MODES.AGENDA && user?.name) {
        fetchSchedule();
    }
    if (currentSection === SECTION_MODES.VENDAS) {
        const loadSales = async () => {
            const fetchedSales = await fetchSales();
            setSales(fetchedSales);
        };
        loadSales();
    }
  }, [currentSection, productCrudMode, professorCrudMode, isLoggedIn, user?.name]);


  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    // Se o user.role for 'adm', a seção inicial (AGENDAMENTOS) será a mesma e ele terá acesso total.
    // Se não for 'adm', a seção inicial (AGENDAMENTOS) será a mesma, mas a navegação será restrita
    // pelo JSX do ProfessorPainel.
    // Não é necessário um setCurrentSection aqui, pois o estado inicial já é AGENDAMENTOS.
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  if (!isLoggedIn) {
      return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // FUNÇÕES DE MANIPULAÇÃO DE ESTADO
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target; 
    setProductFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleProfessorInputChange = (e) => {
    const { name, value } = e.target;
    setProfessorFormData(prev => ({ ...prev, [name]: value }));
  };

  // ====================================================================
  // HANDLERS PARA O ARRAY DE ESPECIALIDADES 
  // ====================================================================
  const handleAddSpecialty = () => {
    setProfessorFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, { typeDance: "", pricePerClass: "" }],
    }));
  };

  const handleRemoveSpecialty = (index) => {
    setProfessorFormData(prev => ({
        ...prev,
        specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const handleSpecialtyChange = (index, field, value) => {
      setProfessorFormData(prev => ({
          ...prev,
          specialties: prev.specialties.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
          ),
      }));
  };
  // ====================================================================
  // FIM HANDLERS PARA O ARRAY DE ESPECIALIDADES
  // ====================================================================

  const resetProductForm = () => {
    setProductFormData({ 
      nome: "", descricao: "", preco: "", imagens: [], repassarFrete: false, 
      cepOrigem: "", peso: "", altura: "", largura: "", formato: "1" // Resetar novos campos
    }); 
    setEditingProductId(null);
  }

  const resetProfessorForm = () => {
    setProfessorFormData({ name: "", description: "", email: "", password: "", specialties: [], picture: "", pix: "" }); 
    setEditingProfessorId(null);
  }

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            const base64 = await fileToBase64(file);
            setProfessorFormData(prev => ({ ...prev, picture: base64 }));
        } catch (error) {
            console.error("Erro ao processar imagem:", error);
            alert("Erro ao processar imagem.");
        }
    }
    e.target.value = null;
  }

  const handleRemovePicture = () => {
    setProfessorFormData(prev => ({ ...prev, picture: "" }));
  }

  const fetchSales = async () => {
    try {
        setSalesIsLoading(true);
        const response = await axios.get(`${API_URL}/getPayments`);
        return response.data.payments || [];
    } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        alert("Erro ao buscar as vendas. Verifique o console para detalhes.");
        return [];
    } finally {
        setSalesIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/getProducts`);
        return response.data.products || [];
    } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        alert("Erro ao buscar produtos. Verifique o console para detalhes.");
        return [];
    } finally {
        setIsLoading(false);
    }
  }

  const fetchProfessors = async () => {
    try {
        setProfessorIsLoading(true);
        const response = await axios.get(`${API_URL}/getProfessor`);
        return response.data.professors || [];
    } catch (error) {
        console.error("Erro ao buscar professores:", error);
        alert("Erro ao buscar professores. Verifique o console para detalhes.");
        return [];
    } finally {
        setProfessorIsLoading(false);
    }
  }

  // FUNÇÕES CRUD DE PROFESSOR (MODIFICADO: Payload com specialties)
  const handleAddProfessor = async () => {
    const professorData = { 
        name: professorFormData.name,
        description: professorFormData.description,
        email: professorFormData.email,
        password: professorFormData.password,
        specialties: professorFormData.specialties, // MODIFICADO: NOVO CAMPO NA ORDEM CORRETA
        picture: professorFormData.picture,
        pix: professorFormData.pix, 
    }; 
    try {
        await axios.post(`${API_URL}/addProfessor`, JSON.stringify(professorData), {
            headers: { 'Content-Type': 'application/json' }
        });
        alert(`Professor "${professorFormData.name}" cadastrado com sucesso!`);
    } catch (error) {
        console.error("Erro ao cadastrar professor:", error.response?.data || error);
        alert(`Erro ao cadastrar professor. ${error.response?.data?.error || 'Verifique o console.'}`);
        throw error;
    }
  }

  const handleEditProfessor = async () => {
    if (!editingProfessorId) return;

    const professorData = { 
        name: professorFormData.name,
        description: professorFormData.description,
        email: professorFormData.email,
        specialties: professorFormData.specialties, // MODIFICADO: NOVO CAMPO NA ORDEM CORRETA
        picture: professorFormData.picture,
        ...(professorFormData.password ? { password: professorFormData.password } : {}), 
        pix: professorFormData.pix, 
    }; 

    try {
        await axios.post(`${API_URL}/editProfessor/${editingProfessorId}`, JSON.stringify(professorData), {
            headers: { 'Content-Type': 'application/json' }
        });
        alert(`Professor "${professorFormData.name}" atualizado com sucesso!`);
    } catch (error) {
        console.error("Erro ao atualizar professor:", error.response?.data || error);
        alert(`Erro ao atualizar professor. ${error.response?.data?.error || 'Verifique o console.'}`);
        throw error;
    }
  }

  const handleDeleteProfessor = async (id, name) => {
    if (!window.confirm(`Tem certeza que deseja deletar o professor ${name}?`)) {
        return;
    }

    try {
      await axios.delete(`${API_URL}/deleteProfessor/${id}`);
      setProfessores(prev => prev.filter(p => p._id !== id));
      alert('Professor deletado com sucesso!');

    } catch (error) {
        console.error('Erro ao deletar professor:', error.response || error);
        alert('Erro ao deletar professor. Verifique o console para detalhes.');
    }
  };

  // MODIFICADO: Validação para o array specialties
  const handleSubmitProfessor = async (e) => {
    e.preventDefault();
    
    // NOVO: Validação do array specialties
    if (professorFormData.specialties.length === 0) {
        alert("Pelo menos uma especialidade com preço é obrigatória.");
        return;
    }
    
    const invalidSpecialty = professorFormData.specialties.find(s => 
        !s.typeDance || s.typeDance.trim() === "" || parseFloat(s.pricePerClass) <= 0 || isNaN(parseFloat(s.pricePerClass))
    );
    if (invalidSpecialty) {
        alert("Todas as especialidades devem ter um nome e um preço por aula válido e positivo.");
        return;
    }
    // FIM NOVO
    
    if (!professorFormData.pix) { 
        alert("A Chave PIX é obrigatória para cadastro.");
        return;
    }

    try {
        if (professorCrudMode === CRUD_MODES.ADD) {
            await handleAddProfessor();
        } else if (professorCrudMode === CRUD_MODES.EDIT) {
            await handleEditProfessor();
        }

        resetProfessorForm();
        setProfessorCrudMode(CRUD_MODES.LIST);

    } catch (error) {
        return;
    }
  };

  // MODIFICADO: Busca o array specialties do professor
  const startEditProfessor = (professor) => {
    setEditingProfessorId(professor._id);
    setProfessorFormData({
        name: professor.name,
        description: professor.description,
        email: professor.email,
        password: "",
        specialties: professor.specialties || [], // MODIFICADO
        picture: professor.picture,
        pix: professor.pix || "", 
    });
    setProfessorCrudMode(CRUD_MODES.EDIT);
  };


  // ====================================================================
  // FUNÇÕES DE CONFIGURAÇÃO DE AGENDA (ATUALIZADAS)
  // ====================================================================

  // Busca e interpreta a configuração unificada da agenda
  const fetchSchedule = async () => {
    if (!user || !user.name) {
        console.error("Erro: Nome do professor logado não disponível para buscar a agenda.");
        setScheduleFormData(initialSchedule);
        setMonthlyAvailability({});
        setSpecificDates([]);
        return;
    }

    try {
        // Tenta buscar a configuração salva
        const response = await axios.post(`${API_URL}/findConfigSchedule`, 
            { professor: user.name },
            { headers: { 'Content-Type': 'application/json' } }
        );
        
        const savedConfig = response.data.config || response.data;

        if (Array.isArray(savedConfig) && savedConfig.length > 0) {
            const isUnifiedFormat = savedConfig.some(item => item.hasOwnProperty('type'));

            if (isUnifiedFormat) {
                // Novo formato: Parse e distribui a configuração unificada
                const weekly = savedConfig.filter(c => c.type === 'WEEKLY_PATTERN').map(({ type, ...rest }) => rest);
                const monthly = savedConfig.filter(c => c.type === 'MONTHLY_AVAILABILITY');
                const specific = savedConfig.filter(c => c.type === 'SPECIFIC_DATE').map(({ type, ...rest }) => rest);

                setScheduleFormData(weekly.length > 0 ? weekly : initialSchedule);

                const monthlyData = monthly.reduce((acc, curr) => {
                    acc[curr.monthIndex] = curr.available;
                    return acc;
                }, {});
                setMonthlyAvailability(monthlyData);
                
                setSpecificDates(specific.length > 0 ? specific : []);
            } else {
                // Formato antigo: Assume que é apenas a agenda semanal
                console.log("Formato de agenda antigo detectado. Carregando apenas a agenda semanal.");
                setScheduleFormData(savedConfig);
                setMonthlyAvailability({});
                setSpecificDates([]);
            }
        } else {
            // Nenhuma configuração encontrada, usa os padrões
            console.log("Nenhuma configuração de agenda encontrada, usando os padrões.");
            setScheduleFormData(initialSchedule);
            setMonthlyAvailability({});
            setSpecificDates([]);
        }

    } catch (error) {
        console.error("Erro ao buscar a configuração da agenda:", error.response?.data || error.message);
        // Fallback para os padrões em caso de erro
        setScheduleFormData(initialSchedule);
        setMonthlyAvailability({});
        setSpecificDates([]);
    }
  };

  const handleScheduleChange = (index, field, value) => {
      setScheduleFormData(prevSchedule =>
          prevSchedule.map((item, i) =>
              i === index ? { ...item, [field]: value } : item
          )
      );
  };

  // Unifica os dados da agenda e envia para o backend
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.name) {
        alert("❌ Erro de autenticação: Nome do professor não encontrado.");
        return;
    }

    // Validações
    const invalidWeeklyTime = scheduleFormData.find(day => day.active && day.start >= day.end);
    if (invalidWeeklyTime) {
        alert(`Erro em Padrão Semanal: O horário de início (${invalidWeeklyTime.start}) deve ser anterior ao de fim (${invalidWeeklyTime.end}).`);
        return;
    }
    const invalidSpecificTime = specificDates.find(date => date.active && date.start >= date.end);
    if (invalidSpecificTime) {
        alert(`Erro em Datas Específicas: O horário de início (${invalidSpecificTime.start}) deve ser anterior ao de fim (${invalidSpecificTime.end}) para a data ${invalidSpecificTime.date}.`);
        return;
    }

    // Cria a configuração unificada
    const unifiedConfig = [];

    // 1. Adiciona o padrão semanal
    scheduleFormData.forEach(day => {
        unifiedConfig.push({ type: 'WEEKLY_PATTERN', ...day });
    });

    // 2. Adiciona a disponibilidade mensal
    Object.keys(monthlyAvailability).forEach(monthIndex => {
        unifiedConfig.push({
            type: 'MONTHLY_AVAILABILITY',
            monthIndex: parseInt(monthIndex, 10),
            available: monthlyAvailability[monthIndex]
        });
    });

    // 3. Adiciona as datas específicas
    specificDates.forEach(date => {
        unifiedConfig.push({ type: 'SPECIFIC_DATE', ...date });
    });

    // Monta o payload para a API
    const payload = {
        professor: user.name,
        config: unifiedConfig,
    };

    try {
        await axios.post(`${API_URL}/AddConfigSchedule`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        alert('✅ Configurações da agenda salvas com sucesso!');
        fetchSchedule(); // Re-busca os dados para garantir consistência

    } catch (error) {
        console.error("Erro ao salvar a agenda:", error.response?.data || error);
        alert(`❌ Erro ao salvar a agenda. ${error.response?.data?.error || 'Verifique o console para detalhes.'}`);
    }
  };
  
  // Funções de manipulação da NOVA AGENDA
  const handleMonthlyChange = (monthIndex, value) => {
      setMonthlyAvailability(prev => ({
          ...prev,
          [monthIndex]: value,
      }));
  };
  
  const handleSpecificDateAdd = () => {
      const newDate = {
          date: new Date().toISOString().substring(0, 10), // Data atual
          active: true,
          start: '09:00',
          end: '18:00',
      };
      setSpecificDates(prev => [...prev, newDate]);
  };
  
  const handleSpecificDateChange = (index, field, value) => {
      setSpecificDates(prev => 
          prev.map((item, i) => 
              i === index ? { ...item, [field]: value } : item
          )
      );
  };
  
  const handleSpecificDateRemove = (indexToRemove) => {
      setSpecificDates(prev => prev.filter((_, i) => i !== indexToRemove));
  };
  // Fim Funções de manipulação da NOVA AGENDA


  // FUNÇÕES DE NAVEGAÇÃO
  const switchToProfessorList = () => {
    resetProfessorForm();
    setCurrentSection(SECTION_MODES.PROFESSORES);
    setProfessorCrudMode(CRUD_MODES.LIST);
  };

  const switchToProfessorAddForm = () => {
     resetProfessorForm();
     setProfessorCrudMode(CRUD_MODES.ADD);
  };

  const switchToProductList = () => {
    resetProductForm();
    setCurrentSection(SECTION_MODES.PRODUTOS);
    setProductCrudMode(CRUD_MODES.LIST);
  };

  const switchToProductAddForm = () => {
     resetProductForm();
     setProductCrudMode(CRUD_MODES.ADD);
  };

  const switchToAgendaConfig = () => {
      setCurrentSection(SECTION_MODES.AGENDA);
  }
  
  const switchToPackageCreation = () => {
      setCurrentSection(SECTION_MODES.PACOTES);
      setPackageCreationMode(CRUD_MODES.LIST);
      setSelectedProfessorsForPackage([]); 
      // Reinicializa o formulário do pacote com as novas chaves
      setPackageFormData({ packageName: "", price: "", description: "", professorClasses: {} }); 
  };


  // FUNÇÕES CRUD DE PRODUTO 
  const handleProductImageChange = async (e) => {
    const newlySelectedFiles = Array.from(e.target.files);
    const maxImages = 3;
    const availableSlots = maxImages - productFormData.imagens.length;

    if (availableSlots <= 0) {
        alert(`Você já atingiu o limite de ${maxImages} imagens.`);
        e.target.value = null;
        return;
    }
    const filesToUse = newlySelectedFiles.slice(0, availableSlots);
    if (filesToUse.length === 0) {
        e.target.value = null;
        return;
    }
    if (filesToUse.length < newlySelectedFiles.length) {
        alert(`Você só pode adicionar mais ${availableSlots} imagem(ns). As imagens excedentes foram ignoradas.`);
    }

    try {
        const base64Strings = await Promise.all(
            filesToUse.map(fileToBase64)
        );
        setProductFormData(prevState => ({
          ...prevState,
          imagens: [...prevState.imagens, ...base64Strings],
        }));
    } catch (error) {
        console.error("Erro ao converter arquivo para Base64:", error);
        alert("Ocorreu um erro ao processar as imagens.");
    }
    e.target.value = null;
  };

  const handleRemoveProductImage = (indexToRemove) => {
    setProductFormData(prevState => ({
      ...prevState,
      imagens: prevState.imagens.filter((_, index) => index !== indexToRemove),
    }));
  };

  async function handleAddProduct() {
    // Mapeamento dos campos do frontend (productFormData) para os campos do backend (/addProduct)
    const productData = {
        nameProduct: productFormData.nome,
        description: productFormData.descricao,
        value: productFormData.preco,
        images: productFormData.imagens,
        // NOVOS CAMPOS DE FRETE E DIMENSÕES conforme a rota do backend:
        frete: productFormData.repassarFrete, // 'repassarFrete' do frontend -> 'frete' do backend (boolean)
        CEP: productFormData.cepOrigem,      // 'cepOrigem' do frontend -> 'CEP' do backend
        wheight: productFormData.peso,       // 'peso' do frontend -> 'wheight' do backend
        height: productFormData.altura,      // 'altura' do frontend -> 'height' do backend
        width: productFormData.largura,      // 'largura' do frontend -> 'width' do backend
    };
    try {
        await axios.post(`${API_URL}/addProduct`, JSON.stringify(productData), {
            headers: { 'Content-Type': 'application/json' }
        });
        alert(`Produto "${productFormData.nome}" cadastrado com sucesso!`);
    } catch (error) {
        console.error("Erro ao cadastrar produto:", error.response || error);
        alert("Erro ao cadastrar produto. Verifique o console para detalhes.");
        throw error;
    }
  }

  const handleEditProduct = async () => {
    if (!editingProductId) return;
    // Mapeamento dos campos do frontend (productFormData) para os campos do backend (/editProduct)
    const productData = {
        nameProduct: productFormData.nome,
        description: productFormData.descricao,
        value: productFormData.preco,
        images: productFormData.imagens,
        // NOVOS CAMPOS DE FRETE E DIMENSÕES conforme a rota do backend:
        frete: productFormData.repassarFrete, // 'repassarFrete' do frontend -> 'frete' do backend (boolean)
        CEP: productFormData.cepOrigem,      // 'cepOrigem' do frontend -> 'CEP' do backend
        wheight: productFormData.peso,       // 'peso' do frontend -> 'wheight' do backend
        height: productFormData.altura,      // 'altura' do frontend -> 'height' do backend
        width: productFormData.largura,      // 'largura' do frontend -> 'width' do backend
    };
    try {
        await axios.post(`${API_URL}/editProduct/${editingProductId}`, JSON.stringify(productData), {
            headers: { 'Content-Type': 'application/json' }
        });
        alert(`Produto "${productFormData.nome}" atualizado com sucesso!`);
    } catch (error) {
        console.error("Erro ao atualizar produto:", error.response || error);
        alert("Erro ao atualizar produto. Verifique o console para detalhes.");
        throw error;
    }
  };

  const handleSubmitProduto = async (e) => {
    e.preventDefault();
    if (productFormData.imagens.length === 0) {
        alert("Por favor, selecione pelo menos uma imagem.");
        return;
    }
    
    // NOVAS VALIDAÇÕES DE ENVIO
    if (!productFormData.cepOrigem) {
        alert("O CEP de origem é obrigatório.");
        return;
    }

    // Usar String(value) e replace para permitir vírgula e garantir que é um número
    const pesoNumerico = parseFloat(String(productFormData.peso).replace(',', '.'));
    const alturaNumerica = parseFloat(String(productFormData.altura).replace(',', '.'));
    const larguraNumerica = parseFloat(String(productFormData.largura).replace(',', '.'));

    if (isNaN(pesoNumerico) || pesoNumerico <= 0) {
        alert("O Peso deve ser um valor numérico positivo (em kg).");
        return;
    }
    if (isNaN(alturaNumerica) || alturaNumerica <= 0) {
        alert("A Altura deve ser um valor numérico positivo (em cm).");
        return;
    }
    if (isNaN(larguraNumerica) || larguraNumerica <= 0) {
        alert("A Largura deve ser um valor numérico positivo (em cm).");
        return;
    }
    if (!productFormData.formato) {
        alert("O Formato do pacote é obrigatório.");
        return;
    }
    // FIM NOVAS VALIDAÇÕES
    
    const precoNumerico = parseFloat(productFormData.preco);
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
        alert("O preço deve ser um valor numérico positivo.");
        return;
    }
    
    try {
        if (productCrudMode === CRUD_MODES.ADD) {
            await handleAddProduct();
        } else if (productCrudMode === CRUD_MODES.EDIT) {
            await handleEditProduct();
        }
        resetProductForm();
        setProductCrudMode(CRUD_MODES.LIST);
    } catch (error) {
        return;
    }
  };

  const startEditProduct = (produto) => {
    setEditingProductId(produto._id);
    setProductFormData({
        nome: produto.nameProduct,
        descricao: produto.description,
        preco: String(produto.price),
        imagens: produto.images,
        repassarFrete: !!produto.repassarFrete, 
        // CAMPOS DE ENVIO
        cepOrigem: produto.cepOrigem || "",
        peso: produto.peso || "",
        altura: produto.altura || "",
        largura: produto.largura || "",
        formato: produto.formato || "1",
    });
    setProductCrudMode(CRUD_MODES.EDIT);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este produto?")) {
        return;
    }
    try {
      await axios.delete(`${API_URL}/deleteProduct/${id}`);
      setProdutos(prevProdutos => prevProdutos.filter(p => p._id !== id));
      alert('Produto deletado com sucesso!');
    } catch (error) {
        console.error('Erro ao deletar produto:', error.response || error);
        alert('Erro ao deletar produto. Verifique o console para detalhes.');
    }
  };
  
  // ====================================================================
  // FUNÇÕES CRUD DE PACOTES (MODIFICADAS)
  // ====================================================================

  const toggleProfessorSelection = (professorId) => {
    setSelectedProfessorsForPackage(prev => 
        prev.includes(professorId)
            ? prev.filter(id => id !== professorId)
            : [...prev, professorId]
    );
  };
  
  // MODIFICADA: Usa as novas chaves 'packageName', 'price', 'description'
  const handlePackageFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'packageName' || name === 'price' || name === 'description') {
        setPackageFormData(prev => ({ ...prev, [name]: value }));
    } else {
        const [prefix, profId] = name.split('-');
        if (prefix === 'classes') {
            setPackageFormData(prev => ({
                ...prev,
                professorClasses: {
                    ...prev.professorClasses,
                    [profId]: parseInt(value) || 0,
                },
            }));
        }
    }
  };
  
  // MODIFICADA: Usa as novas chaves
  const handleStartPackageCreation = () => {
    if (selectedProfessorsForPackage.length < 2) {
        alert("Selecione no mínimo 2 professores para criar um pacote.");
        return;
    }
    const initialClasses = selectedProfessorsForPackage.reduce((acc, profId) => {
        acc[profId] = 1;
        return acc;
    }, {});
    setPackageFormData({ 
        packageName: "", // Usar a nova chave
        price: "", // Usar a nova chave
        description: "", // Inicializar descrição
        professorClasses: initialClasses,
    });
    setPackageCreationMode(CRUD_MODES.ADD);
  };

  // MODIFICADA: Implementa a coleta de dados, validação e requisição POST
  const handleSubmitPackage = async (e) => {
    e.preventDefault();

    const { packageName, price, description, professorClasses } = packageFormData;
    
    // Validação básica
    if (!packageName.trim() || !price || parseFloat(price) <= 0 || !description.trim()) {
        alert("Por favor, preencha o nome do pacote, a descrição e o valor total (deve ser positivo).");
        return;
    }

    const finalPrice = parseFloat(price);
    if (isNaN(finalPrice) || finalPrice <= 0) {
        alert("O valor total deve ser um número positivo.");
        return;
    }
    
    const professorsInPackage = professores.filter(p => selectedProfessorsForPackage.includes(p._id));
    
    // Prepara o array de professores com quantidade de aulas
    const professorsArray = professorsInPackage
        .map(professor => {
            const quantityClassess = professorClasses[professor._id] || 0;
            if (quantityClassess <= 0) {
                // Ignore professores com 0 aulas
                return null;
            }
            return {
                name: professor.name,
                image: professor.picture || '', // 'picture' do professor é a 'image'
                quantityClassess: quantityClassess,
            };
        })
        .filter(p => p !== null);

    if (professorsArray.length === 0) {
        alert("O pacote deve ter pelo menos 1 aula com um professor selecionado.");
        return;
    }

    const payload = {
        name: packageName,
        totalValue: finalPrice,
        description: description,
        professors: professorsArray,
    };

    try {
        const response = await axios.post(`${API_URL}/createPackage`, payload, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.data && response.data.package) {
            setPackageSuccessMessage(`Pacote "${packageName}" criado com sucesso!`);
            setShowPackageSuccessModal(true);
            setPackageCreationMode(CRUD_MODES.LIST); // Volta para a seleção
            setSelectedProfessorsForPackage([]);
        } else {
            alert("Erro desconhecido ao cadastrar pacote.");
        }

    } catch (error) {
        console.error("Erro ao cadastrar pacote:", error.response?.data || error);
        alert(`Erro ao cadastrar pacote. ${error.response?.data?.error || 'Verifique o console.'}`);
    }
  };


  // ====================================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // ====================================================================

  const renderProductList = () => {
    // ... (Mantido o código de Listagem de Produtos)
    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-7xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#201E1E" }}>Lista de Produtos</h2>
            
            <div className="flex justify-end mb-4">
                <button 
                    onClick={switchToProductAddForm}
                    className="font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                    style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                >
                    + Adicionar Produto
                </button>
            </div>

            {isLoading ? (
                <p className="text-center py-4">Carregando produtos...</p>
            ) : produtos.length === 0 ? (
                <p className="text-center py-4">Nenhum produto cadastrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {produtos.map((produto) => (
                        <div key={produto._id} className="border rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl" style={{ borderColor: "#A9CBD2", backgroundColor: "#F9FBEE" }}>
                            <ProductImageGallery images={produto.images} nameProduct={produto.nameProduct} />
                            
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-1 line-clamp-2" style={{ color: "#201E1E" }}>{produto.nameProduct}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{produto.description}</p>
                                
                                <p className="text-lg font-bold mt-2" style={{ color: "#201E1E" }}>
                                    R$ {parseFloat(produto.price).toFixed(2)}
                                </p>

                                <p className="text-xs text-gray-500 mt-1">
                                    {produto.repassarFrete ? 'Frete repassado ao cliente' : 'Frete por conta da loja'}
                                </p>
                                
                                <div className="flex space-x-2 mt-4">
                                    <button 
                                        onClick={() => startEditProduct(produto)}
                                        className="flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition bg-blue-400 hover:bg-blue-500 text-white"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProduct(produto._id)}
                                        className="flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition bg-red-400 hover:bg-red-500 text-white"
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  }

  const renderProductForm = () => {
    const isEditing = productCrudMode === CRUD_MODES.EDIT;
    
    // Esta parte do código já estava completa, mas a deixo aqui para que o componente esteja 100% completo.
    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-4xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "#201E1E" }}>
                {isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}
            </h2>
            
            <form onSubmit={handleSubmitProduto} className="space-y-6">
                
                {/* INFORMAÇÕES BÁSICAS */}
                <div>
                    <label htmlFor="nome" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Nome do Produto</label>
                    <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={productFormData.nome}
                        onChange={handleProductInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div>
                    <label htmlFor="descricao" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Descrição</label>
                    <textarea
                        id="descricao"
                        name="descricao"
                        rows="3"
                        value={productFormData.descricao}
                        onChange={handleProductInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="preco" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Preço (R$)</label>
                        <input
                            type="number"
                            id="preco"
                            name="preco"
                            value={productFormData.preco}
                            onChange={handleProductInputChange}
                            required
                            min="0.01"
                            step="0.01"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="flex items-center mt-6">
                        <input
                            type="checkbox"
                            id="repassarFrete"
                            name="repassarFrete"
                            checked={productFormData.repassarFrete}
                            onChange={handleProductInputChange}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="repassarFrete" className="ml-3 text-sm font-medium" style={{ color: "#201E1E" }}>Repassar custo do frete ao cliente</label>
                    </div>
                </div>
                
                {/* INFORMAÇÕES DE ENVIO */}
                <div className="pt-4 border-t">
                    <h3 className="text-xl font-medium mb-4" style={{ color: "#201E1E" }}>Informações de Envio (Obrigatório para Frete)</h3>
                    
                    <div>
                        <label htmlFor="cepOrigem" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>CEP de Origem (Somente números)</label>
                        <input
                            type="text"
                            id="cepOrigem"
                            name="cepOrigem"
                            value={productFormData.cepOrigem}
                            onChange={handleProductInputChange}
                            required
                            placeholder="Ex: 01001000"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="mt-4">
                        <label htmlFor="formato" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Formato do Pacote</label>
                        <select
                            id="formato"
                            name="formato"
                            value={productFormData.formato}
                            onChange={handleProductInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="1">1: Caixa/Pacote</option>
                            <option value="2">2: Rolo/Cilindro</option>
                            <option value="3">3: Envelope</option>
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label htmlFor="peso" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Peso (kg)</label>
                            <input
                                type="text"
                                id="peso"
                                name="peso"
                                value={productFormData.peso}
                                onChange={handleProductInputChange}
                                required
                                placeholder="Ex: 0.5"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="altura" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Altura (cm)</label>
                            <input
                                type="text"
                                id="altura"
                                name="altura"
                                value={productFormData.altura}
                                onChange={handleProductInputChange}
                                required
                                placeholder="Ex: 10"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="largura" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Largura (cm)</label>
                            <input
                                type="text"
                                id="largura"
                                name="largura"
                                value={productFormData.largura}
                                onChange={handleProductInputChange}
                                required
                                placeholder="Ex: 20"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                
                {/* UPLOAD E PREVIEW DE IMAGENS */}
                <div className="pt-4 border-t">
                    <label className="block text-xl font-medium mb-3" style={{ color: "#201E1E" }}>Imagens do Produto (Máx: 3)</label>
                    <input
                        type="file"
                        onChange={handleProductImageChange}
                        accept="image/*"
                        multiple
                        disabled={productFormData.imagens.length >= 3}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    
                    <div className="mt-4 flex flex-wrap gap-4">
                        {productFormData.imagens.map((image, index) => (
                            <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                                <img src={image} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveProductImage(index)}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 transition"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={switchToProductList}
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                        style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                    >
                        {isEditing ? 'Salvar Alterações' : 'Cadastrar Produto'}
                    </button>
                </div>
            </form>
        </div>
    );
  }

  // ... (Restante dos componentes de Renderização)
  const renderProfessorList = () => {
    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-7xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#201E1E" }}>Lista de Professores</h2>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={switchToProfessorAddForm}
                    className="font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                    style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                >
                    + Adicionar Professor
                </button>
            </div>
            {professorIsLoading ? (
                <p className="text-center py-4">Carregando professores...</p>
            ) : professores.length === 0 ? (
                <p className="text-center py-4">Nenhum professor cadastrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {professores.map((professor) => (
                        <div key={professor._id} className="border rounded-xl shadow-lg overflow-hidden transition duration-300 hover:shadow-xl" style={{ borderColor: "#A9CBD2", backgroundColor: "#F9FBEE" }}>
                            {professor.picture && (
                                <img src={professor.picture} alt={`Foto de ${professor.name}`} className="w-full h-40 object-cover" />
                            )}
                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-1" style={{ color: "#201E1E" }}>{professor.name}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-3">{professor.description}</p>
                                <div className="mt-3 space-y-1">
                                    <p className="text-sm font-medium">Especialidades:</p>
                                    {professor.specialties?.map((spec, index) => (
                                        <div key={index} className="flex justify-between text-sm text-gray-700 bg-gray-200 px-2 py-1 rounded">
                                            <span>{spec.typeDance}</span>
                                            <span className="font-semibold">R$ {parseFloat(spec.pricePerClass).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <button 
                                        onClick={() => startEditProfessor(professor)}
                                        className="flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition bg-blue-400 hover:bg-blue-500 text-white"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteProfessor(professor._id, professor.name)}
                                        className="flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition bg-red-400 hover:bg-red-500 text-white"
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
  }

  const renderProfessorForm = () => {
    const isEditing = professorCrudMode === CRUD_MODES.EDIT;

    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-4xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "#201E1E" }}>
                {isEditing ? 'Editar Professor' : 'Cadastrar Novo Professor'}
            </h2>
            
            <form onSubmit={handleSubmitProfessor} className="space-y-6">
                
                {/* INFORMAÇÕES BÁSICAS */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Nome do Professor</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={professorFormData.name}
                        onChange={handleProfessorInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Descrição/Bio</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={professorFormData.description}
                        onChange={handleProfessorInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>E-mail (Login)</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={professorFormData.email}
                            onChange={handleProfessorInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Senha {isEditing ? '(Deixe vazio para não alterar)' : ''}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={professorFormData.password}
                            onChange={handleProfessorInputChange}
                            required={!isEditing}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Chave PIX */}
                <div>
                    <label htmlFor="pix" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Chave PIX</label>
                    <input
                        type="text"
                        id="pix"
                        name="pix"
                        value={professorFormData.pix}
                        onChange={handleProfessorInputChange}
                        required
                        placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* ESPECIALIDADES (AULAS) - MODIFICADO */}
                <h3 className="text-xl font-medium pt-4 border-t" style={{ color: "#201E1E" }}>Especialidades e Preço por Aula</h3>
                {professorFormData.specialties.map((specialty, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg bg-gray-50 items-end">
                        <div className="flex-1">
                            <label htmlFor={`typeDance-${index}`} className="block text-sm font-medium mb-1">Nome da Aula/Estilo</label>
                            <input
                                type="text"
                                id={`typeDance-${index}`}
                                value={specialty.typeDance}
                                onChange={(e) => handleSpecialtyChange(index, 'typeDance', e.target.value)}
                                required
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor={`pricePerClass-${index}`} className="block text-sm font-medium mb-1">Preço por Aula (R$)</label>
                            <input
                                type="number"
                                id={`pricePerClass-${index}`}
                                value={specialty.pricePerClass}
                                onChange={(e) => handleSpecialtyChange(index, 'pricePerClass', e.target.value)}
                                required
                                min="0.01"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => handleRemoveSpecialty(index)}
                            className="py-2 px-4 text-sm font-semibold rounded-lg transition bg-red-400 hover:bg-red-500 text-white w-full sm:w-auto"
                        >
                            Remover
                        </button>
                    </div>
                ))}
                
                <button
                    type="button"
                    onClick={handleAddSpecialty}
                    className="font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-[1.01] bg-green-500 hover:bg-green-600 text-white"
                >
                    + Adicionar Especialidade
                </button>

                {/* UPLOAD E PREVIEW DE IMAGEM */}
                <div className="pt-4 border-t">
                    <label className="block text-sm font-medium mb-3" style={{ color: "#201E1E" }}>Foto de Perfil</label>
                    
                    {professorFormData.picture ? (
                        <div className="flex items-center space-x-4">
                            <img src={professorFormData.picture} alt="Preview do Professor" className="w-24 h-24 object-cover rounded-full border-4 border-blue-500" />
                            <button
                                type="button"
                                onClick={handleRemovePicture}
                                className="py-2 px-4 text-sm font-semibold rounded-lg transition bg-red-400 hover:bg-red-500 text-white"
                            >
                                Remover Imagem
                            </button>
                        </div>
                    ) : (
                        <input
                            type="file"
                            onChange={handlePictureChange}
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={switchToProfessorList}
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                        style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                    >
                        {isEditing ? 'Salvar Alterações' : 'Cadastrar Professor'}
                    </button>
                </div>
            </form>
        </div>
    );
  }

  const renderAgendamentos = () => {
    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-4xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#201E1E" }}>Agendamentos Confirmados</h2>
            {agendamentoIsLoading ? (
                <p className="text-center py-4">Carregando agendamentos...</p>
            ) : scheduledClients.length === 0 ? (
                <p className="text-center py-4">Nenhum agendamento confirmado no momento.</p>
            ) : (
                <ul className="space-y-4">
                    {scheduledClients.map((client, index) => (
                        <li key={index} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold" style={{ color: "#201E1E" }}>{client.clientName}</span>
                                <span className="text-sm text-gray-600">{client.clientEmail}</span>
                            </div>
                            <p className="text-sm mt-1">
                                <span className="font-medium">Aula:</span> {client.classType}
                            </p>
                            <p className="text-sm">
                                <span className="font-medium">Data/Hora:</span> {new Date(client.date).toLocaleDateString('pt-BR')} às {client.time}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  }

  const renderSales = () => {
      return (
          <div className="shadow-lg rounded-xl p-6 border max-w-7xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: "#201E1E" }}>Histórico de Vendas (Pagamentos)</h2>

              {salesIsLoading ? (
                  <p className="text-center py-4">Carregando histórico de vendas...</p>
              ) : sales.length === 0 ? (
                  <p className="text-center py-4">Nenhuma venda registrada até o momento.</p>
              ) : (
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                              <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> ID da Transação </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Produto </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Valor (R$) </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Data </th>
                              </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                              {sales.map((sale) => (
                                  <tr key={sale._id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {sale._id.substring(0, 8)}...
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {sale.productName || 'N/A'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-semibold">
                                          {parseFloat(sale.value).toFixed(2)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {new Date(sale.createdAt).toLocaleDateString()}
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
          </div>
      );
  };
  
  // Componente de Configuração Semanal (Sub-componente da Agenda)
  const renderWeeklyConfig = () => (
      <>
          <p className="mb-6 text-gray-600">
              Defina o padrão semanal de sua disponibilidade (horários de início e fim).
          </p>
          <div className="space-y-4">
              {scheduleFormData.map((dayConfig, index) => (
                  <div 
                      key={dayConfig.day} 
                      className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg transition ${dayConfig.active ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200 opacity-60'}`}
                  >
                      <div className="flex items-center w-full sm:w-1/4 mb-2 sm:mb-0">
                          <input 
                              type="checkbox" 
                              id={`active-${index}`}
                              checked={dayConfig.active}
                              onChange={(e) => handleScheduleChange(index, 'active', e.target.checked)}
                              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`active-${index}`} className="ml-3 font-semibold text-lg" style={{ color: dayConfig.active ? "#2563EB" : "#4B5563" }}>
                              {dayConfig.day}
                          </label>
                      </div>
                      <div className="flex gap-4 w-full sm:w-3/4 items-center">
                          <label className="text-sm font-medium whitespace-nowrap">Início:</label>
                          <input
                              type="time"
                              value={dayConfig.start}
                              onChange={(e) => handleScheduleChange(index, 'start', e.target.value)}
                              disabled={!dayConfig.active}
                              className="p-2 border rounded-md shadow-sm w-full sm:w-1/3"
                              required={dayConfig.active}
                          />
                          <label className="text-sm font-medium whitespace-nowrap">Fim:</label>
                          <input
                              type="time"
                              value={dayConfig.end}
                              onChange={(e) => handleScheduleChange(index, 'end', e.target.value)}
                              disabled={!dayConfig.active}
                              className="p-2 border rounded-md shadow-sm w-full sm:w-1/3"
                              required={dayConfig.active}
                          />
                      </div>
                  </div>
              ))}
          </div>
      </>
  );

  // Componente de Configuração de Disponibilidade Mensal (Sub-componente da Agenda)
  const renderMonthlyAvailability = () => (
      <>
          <p className="mb-6 text-gray-600">
              Gerencie a disponibilidade geral para cada mês do ano. O padrão é **disponível**.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {MONTHS.map((month, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg bg-gray-50 justify-between">
                      <span className="font-medium text-gray-700">{month}</span>
                      <select
                          value={monthlyAvailability[index] === false ? 'indisponivel' : 'disponivel'}
                          onChange={(e) => handleMonthlyChange(index, e.target.value === 'disponivel')}
                          className={`p-2 border rounded-md shadow-sm text-sm ${monthlyAvailability[index] === false ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}
                      >
                          <option value="disponivel">Disponível</option>
                          <option value="indisponivel">Indisponível</option>
                      </select>
                  </div>
              ))}
          </div>
      </>
  );

  // Componente de Configuração de Datas Específicas (Sub-componente da Agenda)
  const renderSpecificDates = () => (
      <>
          <p className="mb-6 text-gray-600">
              Use para anular o padrão semanal ou mensal em datas específicas (feriados, eventos, etc.).
          </p>

          <button
              type="button"
              onClick={handleSpecificDateAdd}
              className="font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-[1.01] bg-green-500 hover:bg-green-600 text-white mb-6"
          >
              + Adicionar Data Específica
          </button>
          
          <div className="space-y-4">
              {specificDates.map((dateConfig, index) => (
                  <div 
                      key={index} 
                      className={`flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-lg transition border ${dateConfig.active ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}
                  >
                      <div className="flex items-center w-full sm:w-1/4 mb-2 sm:mb-0 space-x-2">
                          <input
                              type="date"
                              value={dateConfig.date}
                              onChange={(e) => handleSpecificDateChange(index, 'date', e.target.value)}
                              className="p-2 border rounded-md shadow-sm w-full"
                          />
                          <button
                              type="button"
                              onClick={() => handleSpecificDateRemove(index)}
                              className="text-red-500 hover:text-red-700 transition"
                              title="Remover data"
                          >
                              &times;
                          </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 w-full sm:w-3/4 items-center mt-2 sm:mt-0">
                          <div className="flex items-center space-x-2">
                              <input
                                  type="checkbox"
                                  id={`active-specific-${index}`}
                                  checked={dateConfig.active}
                                  onChange={(e) => handleSpecificDateChange(index, 'active', e.target.checked)}
                                  className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <label htmlFor={`active-specific-${index}`} className="text-sm font-medium">Disponível</label>
                          </div>

                          <label className="text-sm font-medium">Início:</label>
                          <input
                              type="time"
                              value={dateConfig.start}
                              onChange={(e) => handleSpecificDateChange(index, 'start', e.target.value)}
                              disabled={!dateConfig.active}
                              className="p-2 border rounded-md shadow-sm w-full sm:w-1/4"
                              required={dateConfig.active}
                          />

                          <label className="text-sm font-medium">Fim:</label>
                          <input
                              type="time"
                              value={dateConfig.end}
                              onChange={(e) => handleSpecificDateChange(index, 'end', e.target.value)}
                              disabled={!dateConfig.active}
                              className="p-2 border rounded-md shadow-sm w-full sm:w-1/4"
                              required={dateConfig.active}
                          />
                      </div>
                  </div>
              ))}
          </div>
      </>
  );

  // Componente Principal de Configuração de Agenda (Mantido)
  const renderAgendaConfiguration = () => {
    let content;
    switch (agendaConfigMode) {
        case AGENDA_CONFIG_MODES.PADRAO_SEMANAL:
            content = renderWeeklyConfig();
            break;
        case AGENDA_CONFIG_MODES.DISPONIBILIDADE_MENSAL:
            content = renderMonthlyAvailability();
            break;
        case AGENDA_CONFIG_MODES.DATAS_ESPECIFICAS:
            content = renderSpecificDates();
            break;
        default:
            content = <p>Selecione um modo de configuração.</p>;
    }

    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-7xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "#201E1E" }}>Configuração de Agenda: {user?.name}</h2>
            
            <div className="flex flex-wrap gap-3 mb-6 border-b pb-4">
                <button
                    onClick={() => setAgendaConfigMode(AGENDA_CONFIG_MODES.PADRAO_SEMANAL)}
                    className={`font-semibold py-2 px-4 rounded-lg transition ${agendaConfigMode === AGENDA_CONFIG_MODES.PADRAO_SEMANAL ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Padrão Semanal
                </button>
                <button
                    onClick={() => setAgendaConfigMode(AGENDA_CONFIG_MODES.DISPONIBILIDADE_MENSAL)}
                    className={`font-semibold py-2 px-4 rounded-lg transition ${agendaConfigMode === AGENDA_CONFIG_MODES.DISPONIBILIDADE_MENSAL ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Disponibilidade Mensal
                </button>
                <button
                    onClick={() => setAgendaConfigMode(AGENDA_CONFIG_MODES.DATAS_ESPECIFICAS)}
                    className={`font-semibold py-2 px-4 rounded-lg transition ${agendaConfigMode === AGENDA_CONFIG_MODES.DATAS_ESPECIFICAS ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Datas Específicas
                </button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
                {content}
                
                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                        type="submit"
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                        style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                    >
                        Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
  }

  const renderPackageSelection = () => {
    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-4xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: "#201E1E" }}>1. Selecione os Professores para o Pacote</h2>
            <p className="mb-6 text-gray-600">Selecione no mínimo 2 professores para criar um pacote de aulas mistas.</p>

            {professores.length === 0 ? (
                <p className="text-center py-4">Nenhum professor disponível para seleção.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {professores.map(professor => (
                        <div 
                            key={professor._id} 
                            className={`p-4 border rounded-lg cursor-pointer transition ${selectedProfessorsForPackage.includes(professor._id) ? 'bg-blue-100 border-blue-500 shadow-md' : 'bg-white border-gray-300 hover:border-blue-300'}`}
                            onClick={() => toggleProfessorSelection(professor._id)}
                        >
                            <div className="flex items-center">
                                <input 
                                    type="checkbox"
                                    checked={selectedProfessorsForPackage.includes(professor._id)}
                                    onChange={() => {}} // No-op, pois o clique já faz o toggle
                                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
                                />
                                <span className="font-semibold" style={{ color: "#201E1E" }}>{professor.name}</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                {professor.specialties?.length} Especialidade(s)
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end mt-6">
                <button 
                    onClick={handleStartPackageCreation}
                    disabled={selectedProfessorsForPackage.length < 2}
                    className="font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                >
                    {selectedProfessorsForPackage.length < 2 ? `Selecione mais ${2 - selectedProfessorsForPackage.length} professor(es)` : '2. Configurar Pacote'}
                </button>
            </div>
        </div>
    );
  };
  
  const renderPackageForm = () => {
    const professorsInPackage = professores.filter(p => selectedProfessorsForPackage.includes(p._id));

    return (
        <div className="shadow-lg rounded-xl p-6 border max-w-4xl mx-auto" style={{ backgroundColor: "#FFFFFF", borderColor: "#A9CBD2" }}>
            <h2 className="text-2xl font-semibold mb-6" style={{ color: "#201E1E" }}>2. Configuração do Pacote</h2>
            
            <form onSubmit={handleSubmitPackage} className="space-y-6">
                
                {/* Detalhes do Pacote */}
                <h3 className="text-xl font-medium pt-4 border-t" style={{ color: "#201E1E" }}>Detalhes Básicos</h3>
                <div>
                    <label htmlFor="packageName" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Nome do Pacote</label>
                    <input
                        type="text"
                        id="packageName"
                        name="packageName"
                        value={packageFormData.packageName}
                        onChange={handlePackageFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Descrição do Pacote</label>
                    <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={packageFormData.description}
                        onChange={handlePackageFormChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-1" style={{ color: "#201E1E" }}>Valor Total do Pacote (R$)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={packageFormData.price}
                        onChange={handlePackageFormChange}
                        required
                        min="0.01"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Aulas por Professor */}
                <h3 className="text-xl font-medium pt-4 border-t" style={{ color: "#201E1E" }}>Aulas por Professor</h3>
                <p className="text-sm text-gray-600 mb-4">Defina quantas aulas cada professor selecionado contribuirá para este pacote.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {professorsInPackage.map(professor => {
                        const profId = professor._id;
                        return (
                            <div key={profId} className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                                <span className="font-semibold" style={{ color: "#201E1E" }}>{professor.name}</span>
                                <div className="flex items-center gap-2">
                                    <label htmlFor={`classes-${profId}`} className="text-sm font-medium whitespace-nowrap">Qtd. Aulas:</label>
                                    <input
                                        type="number"
                                        id={`classes-${profId}`}
                                        name={`classes-${profId}`}
                                        value={packageFormData.professorClasses[profId] || 0}
                                        onChange={handlePackageFormChange}
                                        required
                                        min="1"
                                        step="1"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-between space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => setPackageCreationMode(CRUD_MODES.LIST)}
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition bg-gray-300 hover:bg-gray-400 text-gray-700"
                    >
                        &lt; Voltar
                    </button>
                    <button
                        type="submit"
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                        style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                    >
                        Criar Pacote
                    </button>
                </div>
            </form>
        </div>
    );
  };
  
  // Renderizador de Seções
  const renderProfessorCrud = () => {
    if (professorCrudMode === CRUD_MODES.ADD || professorCrudMode === CRUD_MODES.EDIT) {
        return renderProfessorForm();
    }
    return renderProfessorList();
  }

  const renderProductCrud = () => {
    if (productCrudMode === CRUD_MODES.ADD || productCrudMode === CRUD_MODES.EDIT) {
        return renderProductForm();
    }
    return renderProductList();
  }
  
  const renderPackageCrud = () => {
    if (packageCreationMode === CRUD_MODES.ADD) {
        return renderPackageForm();
    }
    return renderPackageSelection();
  }

  const renderContent = () => {
      switch (currentSection) {
          case SECTION_MODES.AGENDAMENTOS:
              return renderAgendamentos();
          case SECTION_MODES.PRODUTOS:
              return renderProductCrud();
          case SECTION_MODES.PROFESSORES:
              return renderProfessorCrud();
          case SECTION_MODES.VENDAS:
              return renderSales();
          case SECTION_MODES.AGENDA:
              return renderAgendaConfiguration();
          case SECTION_MODES.PACOTES:
              return renderPackageCrud();
          default:
              return <h2 className="text-2xl font-semibold">Bem-vindo(a) ao Painel, {user.name}!</h2>;
      }
  };
  
  const renderPackageSuccessModal = () => {
    if (!showPackageSuccessModal) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <div className="text-green-500 text-6xl mb-4">✔</div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: "#201E1E" }}>Sucesso!</h3>
                <p className="mb-6 text-gray-700">{packageSuccessMessage}</p>
                <button
                    onClick={() => setShowPackageSuccessModal(false)}
                    className="w-full font-semibold py-3 px-6 rounded-lg shadow-md transition transform hover:scale-[1.01]"
                    style={{ backgroundColor: "#9AC3CD", color: "#201E1E" }}
                >
                    Fechar
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9FBEE" }}>
        
        {/* BARRA DE NAVEGAÇÃO */}
        <div className="shadow-lg" style={{ backgroundColor: "#FFFFFF" }}>
            <div className="max-w-7xl mx-auto p-4 flex flex-col sm:flex-row justify-between items-center">
                <h1 className="text-2xl font-bold mb-4 sm:mb-0" style={{ color: "#201E1E" }}>
                    Painel {user.role === 'adm' ? 'ADM' : 'Professor'}
                </h1>
                
                <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                    
                    {/* Botões Comuns */}
                    <button 
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition" 
                        style={{ backgroundColor: currentSection === SECTION_MODES.AGENDAMENTOS ? "#A9CBD2" : "#9AC3CD", color: "#201E1E" }}
                        onClick={() => setCurrentSection(SECTION_MODES.AGENDAMENTOS)}
                    >
                        Agendamentos
                    </button>
                    <button 
                        className="font-semibold py-3 px-6 rounded-lg shadow-md transition" 
                        style={{ backgroundColor: currentSection === SECTION_MODES.AGENDA ? "#A9CBD2" : "#9AC3CD", color: "#201E1E" }}
                        onClick={switchToAgendaConfig}
                    >
                        Minha Agenda
                    </button>

                    {/* Botões de ADM */}
                    {user.role === 'adm' && (
                        <>
                            <button 
                                className="font-semibold py-3 px-6 rounded-lg shadow-md transition" 
                                style={{ backgroundColor: currentSection === SECTION_MODES.PRODUTOS ? "#A9CBD2" : "#9AC3CD", color: "#201E1E" }}
                                onClick={switchToProductList}
                            >
                                Produtos
                            </button>
                            <button 
                                className="font-semibold py-3 px-6 rounded-lg shadow-md transition" 
                                style={{ backgroundColor: currentSection === SECTION_MODES.PROFESSORES ? "#A9CBD2" : "#9AC3CD", color: "#201E1E" }}
                                onClick={switchToProfessorList}
                            >
                                Professores
                            </button>
                            <button 
                                className="font-semibold py-3 px-6 rounded-lg shadow-md transition"
                                style={{ backgroundColor: currentSection === SECTION_MODES.PACOTES ? "#A9CBD2" : "#9AC3CD", color: "#201E1E" }}
                                onClick={switchToPackageCreation}
                            >
                                Criar Pacotes
                            </button>
                            <button 
                                className="font-semibold py-3 px-6 rounded-lg shadow-md transition"
                                style={{ backgroundColor: currentSection === SECTION_MODES.VENDAS ? "#A9CBD2" : "#9AC3CD", color: "#201E1E" }}
                                onClick={() => setCurrentSection(SECTION_MODES.VENDAS)}
                            >
                                Vendas
                            </button>
                        </>
                    )}
                    
                    <button onClick={handleLogout} className="font-semibold py-3 px-6 rounded-lg shadow-md transition bg-red-400 hover:bg-red-500 text-white">
                        Sair
                    </button>
                </div>
            </div>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="p-4 sm:p-8">
            {renderContent()}
        </main>
        
        {/* MODAL DE SUCESSO DO PACOTE */}
        {renderPackageSuccessModal()}
    </div>
  );
};

export default ProfessorPainel;