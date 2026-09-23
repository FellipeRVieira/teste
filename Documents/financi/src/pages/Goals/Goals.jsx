import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "../../components/layout/Header";
import Modal from "../../components/ui/Modal";
import EmptyState from "../../components/ui/EmptyState";
import GoalForm from "../../components/finance/GoalForm";
import GoalRow from "../../components/finance/GoalRow";
import GoalContributionForm from "../../components/finance/GoalContributionForm";
import { useGoals } from "../../hooks/useGoals";

export default function Goals() {
  const { goals, addGoal, editGoal, contributeToGoal, setGoalStatus, deleteGoal } = useGoals();
  const [modalState, setModalState] = useState(null); // { type: "form" | "contribute", mode?, goal? }

  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  function closeModal() {
    setModalState(null);
  }

  function handleSubmitForm(data) {
    if (modalState.mode === "edit") editGoal(modalState.goal.id, data);
    else addGoal(data);
    closeModal();
  }

  function handleContribute(amount) {
    contributeToGoal(modalState.goal.id, amount);
    closeModal();
  }

  function handleTogglePause(goal) {
    setGoalStatus(goal.id, goal.status === "paused" ? "active" : "paused");
  }

  function handleDelete(goal) {
    const confirmed = window.confirm(`Excluir a meta "${goal.title}"? Esta ação não pode ser desfeita.`);
    if (confirmed) deleteGoal(goal.id);
  }

  return (
    <>
      <Header eyebrow="METAS" title="Metas financeiras" />
      <main className="content">
        <p className="page-lead">
          Metas são planos pessoais de organização financeira. Registrar um aporte apenas atualiza o valor guardado
          da meta — nenhuma transferência real é feita entre contas.
        </p>

        <section className="panel">
          <div className="panel-heading">
            <div><h2>Suas metas</h2><p>Acompanhe o progresso de cada plano</p></div>
            <button type="button" className="primary-btn" onClick={() => setModalState({ type: "form", mode: "create" })}>
              <Plus size={18} /> Nova meta
            </button>
          </div>
          {activeGoals.length === 0 ? (
            <EmptyState
              icon="🎯"
              title="Nenhuma meta em andamento"
              description="Crie uma meta para organizar um plano — viagem, reserva de emergência, compra futura, o que fizer sentido para você."
            />
          ) : (
            <div className="goal-manage-list">
              {activeGoals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  onContribute={(g) => setModalState({ type: "contribute", goal: g })}
                  onEdit={(g) => setModalState({ type: "form", mode: "edit", goal: g })}
                  onTogglePause={handleTogglePause}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {completedGoals.length > 0 && (
          <section className="panel" style={{ marginTop: 15 }}>
            <div className="panel-heading">
              <div><h2>Metas concluídas</h2><p>Parabéns pelo progresso</p></div>
            </div>
            <div className="goal-manage-list">
              {completedGoals.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  onContribute={(g) => setModalState({ type: "contribute", goal: g })}
                  onEdit={(g) => setModalState({ type: "form", mode: "edit", goal: g })}
                  onTogglePause={handleTogglePause}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {modalState?.type === "form" && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR META" : "NOVA META"}
          title={modalState.mode === "edit" ? "Editar meta" : "Criar meta"}
          onClose={closeModal}
        >
          <GoalForm
            initialValue={modalState.mode === "edit" ? modalState.goal : undefined}
            onSubmit={handleSubmitForm}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modalState?.type === "contribute" && (
        <Modal eyebrow="APORTE" title="Registrar aporte" onClose={closeModal}>
          <GoalContributionForm goal={modalState.goal} onSubmit={handleContribute} onCancel={closeModal} />
        </Modal>
      )}
    </>
  );
}
