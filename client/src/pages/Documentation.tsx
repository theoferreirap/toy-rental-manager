import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Users, Calendar, FileText, BarChart3, Settings } from "lucide-react";

export default function Documentation() {
  const modules = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Dashboard",
      description: "Visualize métricas-chave do seu negócio",
      features: [
        "Total de reservas",
        "Brinquedos alugados",
        "Receita projetada",
        "Gráficos de resumo",
        "Reservas recentes",
      ],
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Brinquedos",
      description: "Gerencie seu catálogo de brinquedos",
      features: [
        "Cadastro com fotos",
        "Dimensões e especificações",
        "Quantidade disponível",
        "Visualização grid/lista",
        "Seção de manutenção",
      ],
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Clientes",
      description: "Banco de dados completo de clientes",
      features: [
        "Cadastro com WhatsApp",
        "Histórico de reservas",
        "Valor total gasto",
        "Busca avançada",
        "Exportação Excel",
      ],
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Reservas",
      description: "Calendário interativo de reservas",
      features: [
        "Visualização mensal",
        "Detalhes diários",
        "Contato via WhatsApp",
        "Edição de reservas",
        "Filtros de status",
      ],
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Orçamentos & Contratos",
      description: "Gerencie propostas e contratos",
      features: [
        "Criação de orçamentos",
        "Geração de PDF",
        "Envio via WhatsApp",
        "Contratos digitais",
        "Cláusulas editáveis",
      ],
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Ferramentas Adicionais",
      description: "Recursos auxiliares do sistema",
      features: [
        "Catálogo digital compartilhável",
        "Busca de disponibilidade",
        "Temporizador de uso",
        "Gestão financeira",
        "Estatísticas avançadas",
      ],
    },
  ];

  const tips = [
    {
      title: "Integração WhatsApp",
      description:
        "Envie orçamentos, contratos e lembretes diretamente via WhatsApp. Todos os módulos têm botões de contato integrados.",
    },
    {
      title: "Exportações",
      description:
        "Exporte dados em Excel e PDF para relatórios e análises. Disponível em múltiplos módulos.",
    },
    {
      title: "Disponibilidade",
      description:
        "Use a ferramenta de busca de disponibilidade para verificar quais brinquedos estão livres em um período específico.",
    },
    {
      title: "Catálogo Digital",
      description:
        "Compartilhe seu catálogo com clientes via link. Eles podem visualizar todos os brinquedos e solicitar orçamentos.",
    },
    {
      title: "Temporizador",
      description:
        "Controle o tempo de uso de brinquedos durante eventos. Receba alertas quando o tempo expirar.",
    },
    {
      title: "Análises",
      description:
        "Visualize gráficos de receita, clientes top, brinquedos populares e muito mais para tomar decisões informadas.",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-accent" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentação</h1>
          <p className="text-muted-foreground">Guia completo do Toy Rental Manager</p>
        </div>
      </div>

      {/* Modules Overview */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Módulos Principais</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <Card key={index} className="card-elevated flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-accent/10 p-2 text-accent">
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {module.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips & Tricks */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Dicas & Recursos</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {tips.map((tip, index) => (
            <Card key={index} className="card-elevated">
              <CardHeader>
                <CardTitle className="text-lg">{tip.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="card-elevated bg-gradient-to-r from-accent/10 to-blue-500/10">
        <CardHeader>
          <CardTitle className="text-xl">Primeiros Passos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-4">
              <Badge className="mt-1 flex-shrink-0">1</Badge>
              <div>
                <p className="font-medium text-foreground">Configure sua empresa</p>
                <p className="text-sm text-muted-foreground">
                  Acesse Configurações e preencha os dados da sua empresa. Essas informações aparecerão em orçamentos e contratos.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Badge className="mt-1 flex-shrink-0">2</Badge>
              <div>
                <p className="font-medium text-foreground">Cadastre seus brinquedos</p>
                <p className="text-sm text-muted-foreground">
                  Vá para Brinquedos e adicione todos os itens do seu catálogo com fotos, dimensões e preços.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Badge className="mt-1 flex-shrink-0">3</Badge>
              <div>
                <p className="font-medium text-foreground">Registre seus clientes</p>
                <p className="text-sm text-muted-foreground">
                  Cadastre clientes em Clientes com nome, contato e WhatsApp para facilitar a comunicação.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Badge className="mt-1 flex-shrink-0">4</Badge>
              <div>
                <p className="font-medium text-foreground">Crie sua primeira reserva</p>
                <p className="text-sm text-muted-foreground">
                  Vá para Reservas, selecione um cliente e brinquedos, e defina as datas do evento.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Badge className="mt-1 flex-shrink-0">5</Badge>
              <div>
                <p className="font-medium text-foreground">Gere orçamentos e contratos</p>
                <p className="text-sm text-muted-foreground">
                  Use os módulos de Orçamentos e Contratos para criar propostas e documentos legais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Boas Práticas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Mantenha dados atualizados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Atualize regularmente informações de clientes, brinquedos e preços para manter a precisão do sistema.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Use WhatsApp para comunicação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Aproveite a integração com WhatsApp para manter contato rápido com clientes e enviar confirmações.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Monitore disponibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verifique regularmente a disponibilidade de brinquedos para evitar conflitos de reserva.
              </p>
            </CardContent>
          </Card>
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="text-base">Analise seus dados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use o módulo de Estatísticas para entender tendências e tomar decisões baseadas em dados.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Support */}
      <Card className="card-elevated border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle>Precisa de ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            O Toy Rental Manager foi desenvolvido para ser intuitivo e fácil de usar. Explore cada módulo, use os botões de WhatsApp para comunicação rápida e consulte esta documentação sempre que tiver dúvidas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
