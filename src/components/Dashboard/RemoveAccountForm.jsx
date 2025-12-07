import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from '../Shared/Button';
import SelectMenu from '../Shared/SelectMenu';

const RemoveAccountForm = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onCancel,
  onConfirm,
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemoveClick = () => {
    if (!selectedAccountId) {
      alert('Please select an account to remove');
      return;
    }
    setIsConfirming(true);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      // Error handling is done in parent, but we reset loading here if needed
      // However, if parent closes modal on success, this component unmounts.
      // If error, parent should handle alert.
      // We can just reset loading state if we stay mounted.
      setIsDeleting(false);
    }
  };

  if (!isConfirming) {
    return (
      <div className="space-y-4">
        <SelectMenu
          label="Account to Remove"
          name="accountId"
          value={selectedAccountId}
          onChange={(event) => onSelectAccount(event.target.value)}
          options={accounts}
          required
        />
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          Removing an account will also remove its transactions from your dashboard summary.
          This action cannot be undone.
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleRemoveClick}
          >
            Remove Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirmDelete} className="space-y-4">
      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-3">
        <div className="flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Are you sure?</h3>
        </div>
        <p className="text-sm text-red-200/80">
          This action will permanently remove the account and all its transactions.
        </p>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="secondary"
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="danger"
          loading={isDeleting}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Confirm Delete'}
        </Button>
      </div>
    </form>
  );
};

export default RemoveAccountForm;
