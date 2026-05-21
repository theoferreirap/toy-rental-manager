import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { data: settings } = trpc.companySettings.get.useQuery();
  const updateSettings = trpc.companySettings.update.useMutation();

  const [formData, setFormData] = useState({
    companyName: "",
    ownerName: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    website: "",
    taxId: "",
    bankAccount: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || "",
        ownerName: settings.ownerName || "",
        email: settings.email || "",
        phone: settings.phone || "",
        whatsapp: settings.whatsapp || "",
        address: settings.address || "",
        website: settings.website || "",
        taxId: settings.taxId || "",
        bankAccount: settings.bankAccount || "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(formData);
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as informações da sua empresa</p>
      </div>

      {/* Company Settings */}
      <Card className="card-elevated max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Informações da Empresa
          </CardTitle>
          <CardDescription>
            Atualize os dados da sua empresa para aparecer em orçamentos e contratos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label">Nome da Empresa *</label>
                <Input
                  className="form-input"
                  placeholder="Ex: Brinquedos Felizes"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">Nome do Proprietário</label>
                <Input
                  className="form-input"
                  placeholder="Ex: João Silva"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label">Email</label>
                <Input
                  className="form-input"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">Telefone</label>
                <Input
                  className="form-input"
                  placeholder="(11) 3000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* WhatsApp and Website */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label">WhatsApp</label>
                <Input
                  className="form-input"
                  placeholder="(11) 99999-9999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">Website</label>
                <Input
                  className="form-input"
                  placeholder="www.empresa.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="form-label">Endereço</label>
              <Input
                className="form-input"
                placeholder="Rua, número, complemento, cidade, estado"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            {/* Tax and Bank Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="form-label">CNPJ/CPF</label>
                <Input
                  className="form-input"
                  placeholder="00.000.000/0000-00"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">Conta Bancária</label>
                <Input
                  className="form-input"
                  placeholder="Banco, Agência, Conta"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Salvar Configurações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="card-elevated max-w-2xl">
        <CardHeader>
          <CardTitle>Sobre o Sistema</CardTitle>
          <CardDescription>Informações do Toy Rental Manager</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Versão</p>
              <p className="font-semibold text-foreground">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Última Atualização</p>
              <p className="font-semibold text-foreground">Maio de 2026</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Toy Rental Manager é um sistema completo de gestão para empresas de aluguel de brinquedos infláveis e festas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
