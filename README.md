# 🧸 Toy Rental Manager (Gerenciador de Aluguel de Brinquedos)

Um sistema web completo, moderno e elegante projetado especificamente para gerenciar o aluguel de brinquedos para festas, eventos ou uso doméstico. Desenvolvido com as tecnologias web mais modernas e uma interface rica e altamente responsiva (Tailwind CSS v4 + React 19).

---

## 🚀 Visão Geral do Projeto

Este projeto é uma plataforma completa que ajuda empresas de aluguel de brinquedos a gerenciar seus inventários, clientes, reservas, finanças, geração de orçamentos e emissão de contratos. Com foco na facilidade de uso e automatização de processos cotidianos, o sistema conta com integrações avançadas como o envio de mensagens e compartilhamento via WhatsApp, além de geração de documentos em PDF de forma automatizada.

---

## 🎨 Principais Funcionalidades

### 1. 📊 Painel de Controle (Dashboard)
*   **Métricas em Tempo Real:** Acompanhamento instantâneo de Total de Reservas, Brinquedos Atualmente Alugados e Receita Projetada.
*   **Gráficos Interativos:** Resumos visuais de desempenho, incluindo gráficos de Receita vs. Custos, Ticket Médio e Brinquedos Populares.
*   **Lista de Reservas Recentes:** Acesso rápido com filtros dinâmicos de busca.

### 2. 🧸 Gerenciamento de Brinquedos (Inventário)
*   **Visualização Híbrida:** Exibição elegante em grade (grid) ou lista com filtros e ferramentas de busca rápida.
*   **Cadastro Completo:** Cadastro de brinquedos com imagens, especificações e categorização.
*   **Controle de Manutenção:** Seção dedicada para registrar brinquedos em manutenção, histórico de reparos e custos envolvidos.

### 3. 👥 Gerenciamento de Clientes
*   **Ficha Cadastral:** Registro de informações com foco em contato direto (integração rápida via WhatsApp).
*   **Histórico de Reservas:** Painel com o histórico detalhado de todas as locações de cada cliente e cálculo de valor total investido no negócio.
*   **Exportação:** Exportação rápida da base de dados de clientes para o formato **Excel**.

### 4. 📅 Reservas e Calendário Interativo
*   **Calendário Integrado:** Visualização mensal/diária intuitiva para gerenciar a agenda de brinquedos.
*   **Gestão de Status:** Conclusão, edição e cancelamento rápido de reservas.
*   **Filtros de Disponibilidade:** Ferramenta dedicada para buscar brinquedos livres em um determinado período.
*   **Ação Rápida:** Botão para entrar em contato com o cliente via WhatsApp com mensagens pré-formatadas para confirmar o evento.

### 5. 💰 Orçamentos e Catálogo Digital
*   **Catálogo Compartilhável:** Catálogo online interativo com busca de disponibilidade integrada para clientes escolherem brinquedos.
*   **Formulário Integrado:** Clientes podem solicitar orçamentos diretamente pelo catálogo.
*   **Gerador de PDFs:** Geração automatizada de orçamentos profissionais com logo da empresa, dados cadastrais e fotos dos brinquedos selecionados.
*   **Compartilhamento Direto:** Envio do orçamento gerado por e-mail ou via link para o WhatsApp.

### 6. 📝 Contratos Digitais
*   **Contratos Automatizados:** Geração de contratos a partir de modelos padronizados, com cláusulas editáveis.
*   **Gestão de Assinaturas:** Fluxo preparado para formalização de termos com clientes.

### 7. 💵 Gestão Financeira Completa
*   **Fluxo de Caixa:** Lançamentos detalhados de receitas e despesas vinculados ou não a reservas.
*   **Painel Financeiro:** Acompanhamento do saldo atual, despesas acumuladas, valores pendentes e lucro líquido.
*   **Estatísticas Avançadas:** Ranking de clientes mais valiosos, análise de despesas por categoria e desempenho financeiro por dia da semana.

---

## 🛠️ Stack Tecnológica

O projeto utiliza o que há de mais moderno e robusto no ecossistema JavaScript/TypeScript:

*   **Frontend:** [React 19](https://react.dev/) + [Vite](https://vite.dev/) (Build rápido e otimizado).
*   **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) (Estilos utilitários de alta performance) + [Shadcn UI](https://ui.shadcn.com/) (Componentes visuais de design premium).
*   **Roteamento Frontend:** [Wouter](https://github.com/molecula-js/wouter) (Roteador minimalista e performático).
*   **API & Comunicação:** [tRPC v11](https://trpc.io/) (Tipagem ponta-a-ponta entre cliente e servidor sem necessidade de REST manual).
*   **Backend:** [Express 4](https://expressjs.com/) executado com [tsx](https://github.com/privatenumber/tsx) para suporte a TypeScript nativo.
*   **Banco de Dados (ORM):** [Drizzle ORM](https://orm.drizzle.team/) com Driver [MySQL2](https://github.com/sidorares/node-mysql2) (Queries ultra rápidas e seguras).
*   **Testes:** [Vitest](https://vitest.dev/) (Suíte de testes unitários ultrarápida).

---

## ⚙️ Configuração Local e Execução

### Pré-requisitos
Certifique-se de possuir o **Node.js** instalado na sua máquina e o gerenciador de pacotes **pnpm** (recomendado para este projeto).

### Passos para Instalação

1.  **Clone o projeto** e navegue para o diretório raiz:
    ```bash
    git clone <url-do-seu-repositorio>
    cd toy
    ```

2.  **Instale as dependências** do projeto:
    ```bash
    pnpm install
    ```

3.  **Configuração de Variáveis de Ambiente:**
    *   Copie o arquivo `.env.example` para um novo arquivo `.env`:
        ```bash
        cp .env.example .env
        ```
    *   Abra o arquivo `.env` e configure sua string de conexão MySQL em `DATABASE_URL` e as outras chaves necessárias.

4.  **Criação do Banco de Dados e Migração:**
    Rode o comando do Drizzle para empurrar o esquema definido no código para a sua base de dados MySQL local/remota:
    ```bash
    pnpm db:push
    ```

5.  **Inicie o Servidor de Desenvolvimento:**
    ```bash
    pnpm dev
    ```
    O servidor iniciará localmente e fornecerá a URL para visualização direta no seu navegador (geralmente `http://localhost:5173`).

---

## 📂 Estrutura do Código

```
client/
  public/         ← Arquivos de configuração e favicon (não colocar imagens grandes aqui)
  src/
    pages/        ← Páginas principais do sistema (Home, Dashboard, Brinquedos, Clientes, etc.)
    components/   ← Componentes de UI reutilizáveis (Shadcn + layouts)
    contexts/     ← Contextos globais do React (ex: Temas)
    hooks/        ← Hooks customizados
    lib/          ← Configurações e instâncias (como o cliente tRPC)
    App.tsx       ← Gerenciamento de rotas e fluxo principal da aplicação
drizzle/          ← Definições do banco de dados (schema.ts) e configurações de migração
server/
  _core/          ← Configurações centrais do servidor (Plataforma, Auth, Express)
  db.ts           ← Funções e queries SQL estruturadas do banco de dados
  routers.ts      ← Rotas de API e procedures do tRPC
shared/           ← Constantes e tipos de dados compartilhados entre Frontend e Backend
```

---

## 📤 Como Colocar este Projeto no GitHub (Passo a Passo)

Siga os passos abaixo para enviar o projeto de forma segura para o seu perfil pessoal do GitHub:

### Passo 1: Inicializar o Git Localmente
Caso o Git já não esteja configurado, execute no terminal do projeto:
```bash
git init
```

### Passo 2: Adicionar os arquivos ao Git
O arquivo `.gitignore` já está configurado para garantir que pastas pesadas (como `node_modules`) e arquivos de segredos locais (como `.env`) não sejam enviados. Adicione todos os arquivos do projeto com:
```bash
git add .
```

### Passo 3: Criar o primeiro commit
Salve o estado inicial dos arquivos do projeto localmente:
```bash
git commit -m "feat: setup inicial do Gerenciador de Aluguel de Brinquedos"
```

### Passo 4: Criar um Repositório no GitHub
1.  Acesse o seu [GitHub](https://github.com/) e faça login.
2.  No canto superior direito, clique no botão **"+"** e depois em **"New repository"**.
3.  Preencha as informações:
    *   **Repository name:** `toy-rental-manager` (ou o nome que preferir)
    *   **Description:** opcional, você pode copiar uma breve descrição.
    *   **Public/Private:** escolha se deseja deixar o código visível para o público ou restrito.
    *   **Importante:** Deixe desmarcadas as opções de inicializar com README, `.gitignore` ou licença (pois já temos estes arquivos localmente).
4.  Clique em **"Create repository"**.

### Passo 5: Vincular o repositório local ao GitHub e fazer o Push
Na página gerada pelo GitHub, copie os comandos e execute-os no seu terminal. Os comandos serão semelhantes a estes:
```bash
# 1. Renomear a branch principal para 'main'
git branch -M main

# 2. Adicionar o link do repositório remoto (Substitua pela sua URL)
git remote add origin https://github.com/SEU_USUARIO/toy-rental-manager.git

# 3. Enviar o código para o GitHub
git push -u origin main
```

Pronto! Agora o seu projeto está organizado, documentado e publicado de forma totalmente profissional no GitHub. 🚀
