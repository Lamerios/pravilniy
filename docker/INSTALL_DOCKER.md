# 🐳 Установка Docker для Quiz Game

> **Docker не найден в системе. Необходимо установить Docker Desktop для Windows**

## 📥 Установка Docker Desktop

### Автоматическая установка (рекомендуется)
```powershell
# Через winget (если установлен)
winget install Docker.DockerDesktop

# Или через chocolatey (если установлен)
choco install docker-desktop
```

### Ручная установка
1. Скачайте Docker Desktop с официального сайта:
   https://www.docker.com/products/docker-desktop/

2. Запустите установщик и следуйте инструкциям

3. После установки перезагрузите компьютер

4. Запустите Docker Desktop из меню Пуск

## ⚙️ Настройка Docker Desktop

### Системные требования
- Windows 10/11 Pro, Enterprise, или Education
- Включенная виртуализация в BIOS
- Hyper-V или WSL 2

### Включение WSL 2 (рекомендуется)
```powershell
# Запустите PowerShell как администратор
wsl --install
wsl --set-default-version 2
```

### Настройки Docker Desktop
1. Откройте Docker Desktop
2. Settings → General
   - ✅ Use WSL 2 based engine
   - ✅ Start Docker Desktop when you log in

3. Settings → Resources
   - Memory: минимум 4GB (рекомендуется 8GB)
   - CPUs: минимум 2 (рекомендуется 4)
   - Disk: минимум 20GB свободного места

## ✅ Проверка установки

После установки Docker Desktop:

```powershell
# Проверить версию Docker
docker --version

# Проверить версию Docker Compose
docker-compose --version

# Тестовый запуск
docker run hello-world
```

**Ожидаемый вывод:**
```
Docker version 24.0.7, build afdd53b
Docker Compose version v2.21.0
Hello from Docker!
```

## 🚀 Запуск Quiz Game после установки Docker

```bash
# 1. Перезапустите PowerShell/терминал
# 2. Перейдите в папку проекта
cd D:\Projects\Pravilniy

# 3. Запустите сервисы
npm run services:start

# 4. Проверьте статус
npm run services:status
```

## 🐛 Решение проблем

### Docker Desktop не запускается
1. Убедитесь что виртуализация включена в BIOS
2. Включите Hyper-V:
   ```powershell
   Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
   ```
3. Перезагрузите компьютер

### WSL 2 ошибки
```powershell
# Обновить WSL
wsl --update

# Установить Linux kernel update
# Скачайте с: https://aka.ms/wsl2kernel
```

### Проблемы с памятью
1. Docker Desktop → Settings → Resources
2. Увеличьте Memory до 6-8GB
3. Перезапустите Docker Desktop

## 🔗 Полезные ссылки

- [Docker Desktop для Windows](https://docs.docker.com/desktop/install/windows-install/)
- [WSL 2 установка](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker troubleshooting](https://docs.docker.com/desktop/troubleshoot/overview/)

---

## 📋 Чек-лист после установки

- [ ] Docker Desktop установлен
- [ ] WSL 2 включен и настроен
- [ ] Docker Desktop запускается без ошибок
- [ ] `docker --version` работает
- [ ] `docker-compose --version` работает
- [ ] `docker run hello-world` работает
- [ ] `npm run services:start` запускает PostgreSQL и Redis
- [ ] `npm run health:check` показывает что сервисы здоровы

**После выполнения чек-листа можно продолжать разработку!**
