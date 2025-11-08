export default function AjudaPage() {
  return (
    <section className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Central de Ajuda</h1>
      <p className="text-gray-600">
        Aqui você encontra instruções, tutoriais e respostas sobre o sistema.
      </p>

      <div className="space-y-2">
        <h2 className="font-semibold text-lg">Tópicos mais comuns</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Primeiro acesso e login</li>
          <li>Registro de doações</li>
          <li>Como gerar relatórios</li>
          <li>Configurações de conta</li>
        </ul>
      </div>
    </section>
  );
}
