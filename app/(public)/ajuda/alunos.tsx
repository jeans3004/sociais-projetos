import type { Metadata } from "next";

import HelpArticleLayout from "./components/HelpArticleLayout";
import HelpCallout from "./components/HelpCallout";

export const metadata: Metadata = {
  title: "Gerenciar Alunos",
};

export default function HelpStudentsPage() {
  return (
    <HelpArticleLayout
      title="Gerenciar Alunos"
      description="Aprenda a consultar, cadastrar, atualizar e arquivar alunos para manter a base da campanha sempre organizada."
    >
      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Localizando alunos rapidamente</h2>
        <p className="text-muted-foreground">
          Utilize o campo de busca para encontrar alunos pelo nome, turma ou status. A lista é atualizada em tempo real, permitindo identificar duplicidades ou pendências em segundos.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Filtre por turma para concentrar a visualização em uma série específica.</li>
          <li>Verifique o status “Ativo” ou “Inativo” na coluna de situação.</li>
          <li>Ordene por nome para localizar alunos com sobrenomes semelhantes.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Cadastro de novos alunos</h2>
        <p className="text-muted-foreground">
          Clique em “Adicionar aluno” e preencha os campos obrigatórios: nome completo, turma, série e status inicial. Revise as informações antes de salvar para evitar retrabalhos.
        </p>
        <ol className="list-decimal space-y-2 pl-6 text-muted-foreground">
          <li>Informe o nome conforme aparecerá nos relatórios.</li>
          <li>Selecione a turma correta para garantir que a doação seja atribuída ao grupo certo.</li>
          <li>Defina o status como “Ativo” para permitir lançamentos imediatos.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Edição e atualização</h2>
        <p className="text-muted-foreground">
          Ao identificar um erro, utilize a ação “Editar” para ajustar dados do aluno. Alterações são refletidas automaticamente nas doações e relatórios relacionados.
        </p>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Atualize a turma apenas quando houver mudança oficial no registro escolar.</li>
          <li>Corrija nomes duplicados mantendo apenas a versão oficial e atual.</li>
          <li>Registre observações internas quando houver particularidades sobre participação do aluno.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Status ativo e inativo</h2>
        <p className="text-muted-foreground">
          O status indica se o aluno pode receber novas doações. Utilizar “Inativo” é a maneira mais segura de retirar um estudante da campanha sem perder o histórico.
        </p>
        <p className="text-muted-foreground">
          Sempre que um aluno retornar à campanha, reative o cadastro para permitir lançamentos novamente. A reativação conserva todos os registros anteriores, mantendo a consistência nos relatórios.
        </p>
      </section>

      <HelpCallout variant="info">
        Prefira arquivar alunos alterando o status para <span className="font-semibold">“Inativo”</span>. A exclusão permanente só deve ser usada em casos excepcionais, pois remove o vínculo com doações passadas.
      </HelpCallout>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">Exclusão segura</h2>
        <p className="text-muted-foreground">
          Se for necessário remover um aluno definitivamente, confirme que não há doações vinculadas ou que os registros foram transferidos. Essa ação é irreversível e pode gerar lacunas nos relatórios.
        </p>
        <p className="text-muted-foreground">
          Documente a justificativa da exclusão em um canal interno para manter o histórico institucional e evitar dúvidas futuras.
        </p>
      </section>
    </HelpArticleLayout>
  );
}
