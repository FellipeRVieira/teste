import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Header from "../../components/layout/Header";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EmptyState from "../../components/ui/EmptyState";
import CardTile from "../../components/finance/CardTile";
import CardForm from "../../components/finance/CardForm";
import AccountRow from "../../components/finance/AccountRow";
import AccountForm from "../../components/finance/AccountForm";
import CategoryRow from "../../components/finance/CategoryRow";
import CategoryForm from "../../components/finance/CategoryForm";
import CardPurchaseRow from "../../components/finance/CardPurchaseRow";
import CardPurchaseForm from "../../components/finance/CardPurchaseForm";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories";
import { useCardPurchases } from "../../hooks/useCardPurchases";
import { getCardPurchasesSummary } from "../../utils/finance";
import { formatCurrency } from "../../utils/currency";

const TABS = [
  { id: "cards", label: "Cartões" },
  { id: "purchases", label: "Compras" },
  { id: "accounts", label: "Contas" },
  { id: "categories", label: "Categorias" },
];

export default function Cards() {
  const [tab, setTab] = useState("cards");
  const { cards, bankAccounts, addCard, addAccount, editAccount, deactivateAccount, deleteAccount } = useAccounts();
  const { categories, addCategory, editCategory, deactivateCategory, deleteCategory } = useCategories();
  const { getPurchasesByCard, addPurchase, editPurchase, deletePurchase, deletePurchasesByCard } = useCardPurchases();
  const [modalState, setModalState] = useState(null); // { domain, mode, record? }
  const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, confirmLabel, danger, onConfirm }
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || "");

  useEffect(() => {
    if (!cards.some((c) => c.id === selectedCardId)) {
      setSelectedCardId(cards[0]?.id || "");
    }
  }, [cards, selectedCardId]);

  function closeModal() {
    setModalState(null);
  }

  function closeConfirmDialog() {
    setConfirmDialog(null);
  }

  function handleSubmit(data) {
    if (modalState.domain === "card") {
      if (modalState.mode === "edit") editAccount(modalState.record.id, data);
      else addCard(data);
    } else if (modalState.domain === "account") {
      if (modalState.mode === "edit") editAccount(modalState.record.id, data);
      else addAccount(data);
    } else if (modalState.domain === "category") {
      if (modalState.mode === "edit") editCategory(modalState.record.id, data);
      else addCategory(data);
    } else if (modalState.domain === "purchase") {
      if (modalState.mode === "edit") editPurchase(modalState.record.id, data);
      else addPurchase(data);
      if (data.cardId) setSelectedCardId(data.cardId);
    }
    closeModal();
  }

  function handleDeletePurchase(purchase) {
    setConfirmDialog({
      title: "Excluir compra",
      message: `Excluir a compra "${purchase.description}"? Essa ação não pode ser desfeita.`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        deletePurchase(purchase.id);
        closeConfirmDialog();
      },
    });
  }

  const selectedCardPurchases = getPurchasesByCard(selectedCardId);
  const selectedCardSummary = getCardPurchasesSummary(selectedCardPurchases);

  function handleDeactivate(record) {
    setConfirmDialog({
      title: "Desativar registro",
      message: `Desativar "${record.name}"? Lançamentos já existentes continuam mostrando o histórico normalmente.`,
      confirmLabel: "Desativar",
      onConfirm: () => {
        deactivateAccount(record.id);
        closeConfirmDialog();
      },
    });
  }

  function handleDeleteCard(card) {
    const hasPurchases = getPurchasesByCard(card.id).length > 0;
    const warning = hasPurchases
      ? " As compras cadastradas para este cartão também serão excluídas."
      : "";
    setConfirmDialog({
      title: "Excluir cartão",
      message: `Excluir "${card.name}" definitivamente? Essa ação não pode ser desfeita.${warning}`,
      confirmLabel: "Excluir",
      danger: true,
      onConfirm: () => {
        deletePurchasesByCard(card.id);
        deleteAccount(card.id);
        closeConfirmDialog();
      },
    });
  }

  function handleDeleteCategory(category) {
    setConfirmDialog({
      title: "Desativar categoria",
      message: `Desativar a categoria "${category.name}"? Lançamentos já existentes continuam mostrando o histórico normalmente.`,
      confirmLabel: "Desativar",
      onConfirm: () => {
        deactivateCategory(category.id);
        closeConfirmDialog();
      },
    });
  }

  return (
    <>
      <Header eyebrow="DOMÍNIOS DE APOIO" title="Cartões, contas e categorias" />
      <main className="content">
        <p className="page-lead">
          Cartões e contas aqui são registros representativos, atualizados manualmente por você — nenhuma cobrança,
          transferência ou fatura real é processada por esta plataforma.
        </p>

        <div className="tabs-bar">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "cards" && (
          <section className="panel" style={{ marginTop: 15 }}>
            <div className="panel-heading">
              <div><h2>Cartões representativos</h2><p>Limite e fatura são informados manualmente</p></div>
              <button type="button" className="primary-btn" onClick={() => setModalState({ domain: "card", mode: "create" })}>
                <Plus size={18} /> Novo cartão
              </button>
            </div>
            {cards.length === 0 ? (
              <EmptyState
                icon="💳"
                title="Nenhum cartão cadastrado"
                description="Cadastre seus cartões para organizar limite e fatura manualmente."
              />
            ) : (
              <div className="card-grid">
                {cards.map((card) => (
                  <CardTile
                    key={card.id}
                    card={card}
                    onEdit={(c) => setModalState({ domain: "card", mode: "edit", record: c })}
                    onDelete={handleDeleteCard}
                    purchasesSummary={getCardPurchasesSummary(getPurchasesByCard(card.id))}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "purchases" && (
          <section className="panel" style={{ marginTop: 15 }}>
            {cards.length === 0 ? (
              <EmptyState
                icon="🛍️"
                title="Nenhum cartão cadastrado"
                description="Cadastre um cartão na aba Cartões antes de lançar compras parceladas."
              />
            ) : (
              <>
                <div className="panel-heading">
                  <div><h2>Compras por cartão</h2><p>Lançamentos manuais de compras parceladas, organizados por cartão</p></div>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => setModalState({ domain: "purchase", mode: "create" })}
                  >
                    <Plus size={18} /> Nova compra
                  </button>
                </div>

                <div className="tabs-bar card-chips" style={{ margin: "0 20px 14px" }}>
                  {cards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={`tab-btn ${selectedCardId === card.id ? "active" : ""}`}
                      onClick={() => setSelectedCardId(card.id)}
                    >
                      {card.name}
                    </button>
                  ))}
                </div>

                <div className="purchase-summary-bar">
                  <div>
                    <span>Total mensal das compras</span>
                    <strong>{formatCurrency(selectedCardSummary.monthlyTotal)}</strong>
                  </div>
                  <div>
                    <span>Total das compras cadastradas</span>
                    <strong>{formatCurrency(selectedCardSummary.totalAmount)}</strong>
                  </div>
                </div>

                {selectedCardPurchases.length === 0 ? (
                  <EmptyState
                    icon="🛍️"
                    title="Nenhuma compra cadastrada para este cartão"
                    description="Registre as compras parceladas para acompanhar quanto elas somam por mês."
                  />
                ) : (
                  <div className="transaction-list padded">
                    {selectedCardPurchases.map((purchase) => (
                      <CardPurchaseRow
                        key={purchase.id}
                        purchase={purchase}
                        onEdit={(p) => setModalState({ domain: "purchase", mode: "edit", record: p })}
                        onDelete={handleDeletePurchase}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {tab === "accounts" && (
          <section className="panel" style={{ marginTop: 15 }}>
            <div className="panel-heading">
              <div><h2>Contas</h2><p>Registros informativos, sem conexão bancária</p></div>
              <button type="button" className="primary-btn" onClick={() => setModalState({ domain: "account", mode: "create" })}>
                <Plus size={18} /> Nova conta
              </button>
            </div>
            {bankAccounts.length === 0 ? (
              <EmptyState
                icon="🏦"
                title="Nenhuma conta cadastrada"
                description="Cadastre uma conta para organizar seus lançamentos."
              />
            ) : (
              <div className="transaction-list padded">
                {bankAccounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    onEdit={(a) => setModalState({ domain: "account", mode: "edit", record: a })}
                    onDelete={handleDeactivate}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "categories" && (
          <section className="panel" style={{ marginTop: 15 }}>
            <div className="panel-heading">
              <div><h2>Categorias</h2><p>Usadas para classificar receitas e despesas</p></div>
              <button type="button" className="primary-btn" onClick={() => setModalState({ domain: "category", mode: "create" })}>
                <Plus size={18} /> Nova categoria
              </button>
            </div>
            {categories.length === 0 ? (
              <EmptyState
                icon="🏷️"
                title="Nenhuma categoria cadastrada"
                description="Cadastre categorias para organizar seus lançamentos."
              />
            ) : (
              <div className="transaction-list padded">
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onEdit={(c) => setModalState({ domain: "category", mode: "edit", record: c })}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {modalState?.domain === "card" && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR CARTÃO" : "NOVO CARTÃO"}
          title="Dados do cartão"
          onClose={closeModal}
        >
          <CardForm
            initialValue={modalState.mode === "edit" ? modalState.record : undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modalState?.domain === "purchase" && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR COMPRA" : "NOVA COMPRA"}
          title="Compra parcelada"
          onClose={closeModal}
        >
          <CardPurchaseForm
            cards={cards}
            defaultCardId={selectedCardId}
            initialValue={modalState.mode === "edit" ? modalState.record : undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modalState?.domain === "account" && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR CONTA" : "NOVA CONTA"}
          title="Dados da conta"
          onClose={closeModal}
        >
          <AccountForm
            initialValue={modalState.mode === "edit" ? modalState.record : undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modalState?.domain === "category" && (
        <Modal
          eyebrow={modalState.mode === "edit" ? "EDITAR CATEGORIA" : "NOVA CATEGORIA"}
          title="Dados da categoria"
          onClose={closeModal}
        >
          <CategoryForm
            initialValue={modalState.mode === "edit" ? modalState.record : undefined}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          danger={confirmDialog.danger}
          onConfirm={confirmDialog.onConfirm}
          onCancel={closeConfirmDialog}
        />
      )}
    </>
  );
}
