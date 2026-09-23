import { Pause, Pencil, Play, PiggyBank, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { getGoalProgress } from "../../utils/finance";
import ProgressBar from "../ui/ProgressBar";

const STATUS_LABEL = { active: "Em andamento", paused: "Pausada", completed: "Concluída" };

export default function GoalRow({ goal, onContribute, onEdit, onTogglePause, onDelete }) {
  const progress = getGoalProgress(goal);
  const isCompleted = goal.status === "completed";
  const isPaused = goal.status === "paused";

  return (
    <div className={`goal-manage-row ${isCompleted ? "completed" : ""}`}>
      <span className="goal-icon" style={{ background: `${goal.color}1f` }}>{goal.icon}</span>
      <div className="goal-manage-main">
        <div className="goal-manage-top">
          <strong>{goal.title}</strong>
          <span className={`status-badge ${goal.status}`}>{STATUS_LABEL[goal.status] || goal.status}</span>
        </div>
        <small>
          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
          {goal.deadline ? ` · prazo ${new Date(goal.deadline + "T00:00:00").toLocaleDateString("pt-BR")}` : ""}
        </small>
        <ProgressBar percent={progress} />
      </div>
      <strong className="goal-percent">{progress}%</strong>
      <div className="transaction-row-actions">
        {!isCompleted && (
          <button type="button" className="icon-btn small" onClick={() => onContribute(goal)} aria-label="Registrar aporte">
            <PiggyBank size={14} />
          </button>
        )}
        {!isCompleted && (
          <button
            type="button"
            className="icon-btn small"
            onClick={() => onTogglePause(goal)}
            aria-label={isPaused ? "Retomar meta" : "Pausar meta"}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
        <button type="button" className="icon-btn small" onClick={() => onEdit(goal)} aria-label="Editar meta">
          <Pencil size={14} />
        </button>
        <button type="button" className="icon-btn small danger" onClick={() => onDelete(goal)} aria-label="Excluir meta">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
