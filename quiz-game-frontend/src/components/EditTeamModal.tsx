import React, { useEffect, useState } from 'react';
import { teamService } from '../services/team.service';
import { ContactInfo, Team, TeamMember, UpdateTeamDto } from '../types/team.types';
import { validateUpdateTeamForm } from '../utils/validation';
import { TableNumberValidator } from './TableNumberValidator';
import { TeamLogoUpload } from './TeamLogoUpload';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team: Team | null;
}

interface FormData {
  name: string;
  description: string;
  tableNumber: string;
  logoUrl: string;
  members: TeamMember[];
  contactInfo: ContactInfo;
  isActive: boolean;
}

interface FormErrors {
  name?: string;
  tableNumber?: string;
  general?: string;
}

export function EditTeamModal({ isOpen, onClose, onSuccess, team }: EditTeamModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    tableNumber: '',
    logoUrl: '',
    members: [],
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    isActive: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Заполнение формы данными команды
  useEffect(() => {
    if (isOpen && team) {
      setFormData({
        name: team.name,
        description: team.description || '',
        tableNumber: team.tableNumber?.toString() || '',
        logoUrl: team.logoUrl || '',
        members: team.members || [],
        contactInfo: team.contactInfo || {
          email: '',
          phone: '',
          address: ''
        },
        isActive: team.isActive
      });
      setErrors({});
    }
  }, [isOpen, team]);

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field as keyof FormErrors]: undefined }));
    }
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value }
    }));
  };

  const handleMemberAdd = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', email: '', role: '' }]
    }));
  };

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleMemberRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter((_, i) => i !== index)
    }));
  };

  const handleLogoChange = (logoUrl: string | null) => {
    setFormData(prev => ({ ...prev, logoUrl: logoUrl || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!team) return;

    // Валидация формы
    const validationErrors = validateUpdateTeamForm({
      name: formData.name,
      tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : undefined,
      members: formData.members
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const updateData: UpdateTeamDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        tableNumber: formData.tableNumber ? parseInt(formData.tableNumber) : undefined,
        logoUrl: formData.logoUrl || undefined,
        members: formData.members.filter(member => member.name.trim()),
        contactInfo: {
          email: formData.contactInfo.email.trim() || undefined,
          phone: formData.contactInfo.phone.trim() || undefined,
          address: formData.contactInfo.address.trim() || undefined
        },
        isActive: formData.isActive
      };

      await teamService.updateTeam(team.id, updateData);
      onSuccess();
      onClose();
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Ошибка обновления команды'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !team) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">Редактирование команды</h2>
          <button
            type="button"
            className="modal__close"
            onClick={handleClose}
            disabled={loading}
          >
            <i className="icon icon--close"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal__body">
          {errors.general && (
            <div className="alert alert--error">
              <i className="icon icon--warning"></i>
              <span>{errors.general}</span>
            </div>
          )}

          <div className="form-section">
            <h3>Основная информация</h3>

            <div className="form-group">
              <label htmlFor="team-name" className="form-label">
                Название команды *
              </label>
              <input
                id="team-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                placeholder="Введите название команды"
                disabled={loading}
                required
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="team-description" className="form-label">
                Описание
              </label>
              <textarea
                id="team-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-input"
                placeholder="Краткое описание команды"
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="table-number" className="form-label">
                Номер стола
              </label>
              <input
                id="table-number"
                type="number"
                min="1"
                max="999"
                value={formData.tableNumber}
                onChange={(e) => handleInputChange('tableNumber', e.target.value)}
                className={`form-input ${errors.tableNumber ? 'form-input--error' : ''}`}
                placeholder="Номер стола для команды"
                disabled={loading}
              />
              {formData.tableNumber && (
                <TableNumberValidator
                  tableNumber={parseInt(formData.tableNumber)}
                  excludeTeamId={team?.id}
                  onValidationChange={(isValid, message) => {
                    if (!isValid) {
                      setErrors(prev => ({ ...prev, tableNumber: message }));
                    } else {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.tableNumber;
                        return newErrors;
                      });
                    }
                  }}
                />
              )}
              {errors.tableNumber && <span className="form-error">{errors.tableNumber}</span>}
            </div>

            <div className="form-group">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-text">Активная команда</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3>Логотип команды</h3>
            <TeamLogoUpload
              currentLogoUrl={formData.logoUrl}
              onLogoChange={handleLogoChange}
              teamId={team.id}
              disabled={loading}
            />
          </div>

          <div className="form-section">
            <h3>Участники команды</h3>

            <div className="form-group">
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleMemberAdd}
                disabled={loading}
              >
                <i className="icon icon--plus"></i>
                Добавить участника
              </button>
            </div>

            {formData.members.map((member, index) => (
              <div key={index} className="form-group form-group--inline">
                <div className="form-group__col">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="form-input"
                    placeholder="Имя участника"
                    disabled={loading}
                  />
                </div>
                <div className="form-group__col">
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                    className="form-input"
                    placeholder="Email (необязательно)"
                    disabled={loading}
                  />
                </div>
                <div className="form-group__col">
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => handleMemberChange(index, 'role', e.target.value)}
                    className="form-input"
                    placeholder="Роль (необязательно)"
                    disabled={loading}
                  />
                </div>
                <div className="form-group__col form-group__col--actions">
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => handleMemberRemove(index)}
                    disabled={loading}
                  >
                    <i className="icon icon--trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="form-section">
            <h3>Контактная информация</h3>

            <div className="form-group">
              <label htmlFor="contact-email" className="form-label">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleContactInfoChange('email', e.target.value)}
                className="form-input"
                placeholder="Контактный email команды"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-phone" className="form-label">
                Телефон
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                className="form-input"
                placeholder="Контактный телефон команды"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-address" className="form-label">
                Адрес
              </label>
              <textarea
                id="contact-address"
                value={formData.contactInfo.address}
                onChange={(e) => handleContactInfoChange('address', e.target.value)}
                className="form-input"
                placeholder="Адрес команды"
                disabled={loading}
                rows={2}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn--secondary"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
