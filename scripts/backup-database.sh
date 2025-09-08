#!/bin/bash
# ===================================================================
# Quiz Game - Database Backup Script
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DB_NAME="quiz_game_prod"
DB_USER="quiz_user"
DB_HOST="localhost"
DB_PORT="5432"
RETENTION_DAYS=30

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory
create_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Perform database backup
backup_database() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="$BACKUP_DIR/quiz_game_backup_$timestamp.sql"

    log "Starting database backup..."
    log "Database: $DB_NAME"
    log "Backup file: $backup_file"

    # Check if database is accessible
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        error "Database is not accessible. Please check connection parameters."
        exit 1
    fi

    # Perform backup
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --no-password --format=custom --compress=9 \
        --file="$backup_file"; then
        success "Database backup completed: $backup_file"

        # Get backup file size
        local file_size=$(du -h "$backup_file" | cut -f1)
        log "Backup file size: $file_size"

        return 0
    else
        error "Database backup failed"
        return 1
    fi
}

# Compress backup file
compress_backup() {
    local backup_file="$1"
    local compressed_file="${backup_file}.gz"

    log "Compressing backup file..."

    if gzip "$backup_file"; then
        success "Backup compressed: $compressed_file"

        # Get compressed file size
        local file_size=$(du -h "$compressed_file" | cut -f1)
        log "Compressed file size: $file_size"

        echo "$compressed_file"
    else
        error "Backup compression failed"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."

    local deleted_count=0

    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        log "Deleting old backup: $(basename "$file")"
        rm "$file"
        ((deleted_count++))
    done < <(find "$BACKUP_DIR" -name "quiz_game_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0)

    if [[ $deleted_count -gt 0 ]]; then
        success "Deleted $deleted_count old backup files"
    else
        log "No old backup files to delete"
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"

    log "Verifying backup integrity..."

    # Test if the backup file can be read
    if gunzip -t "$backup_file" 2>/dev/null; then
        success "Backup file integrity verified"
        return 0
    else
        error "Backup file is corrupted or invalid"
        return 1
    fi
}

# List available backups
list_backups() {
    log "Available backups:"

    if [[ -d "$BACKUP_DIR" ]] && [[ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
        ls -lah "$BACKUP_DIR"/quiz_game_backup_*.sql.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        warn "No backup files found in $BACKUP_DIR"
    fi
}

# Restore database from backup
restore_database() {
    local backup_file="$1"

    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        exit 1
    fi

    log "Restoring database from backup: $backup_file"
    warn "This will overwrite the current database. Are you sure? (y/N)"

    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log "Restore cancelled"
        exit 0
    fi

    # Check if database is accessible
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
        error "Database is not accessible. Please check connection parameters."
        exit 1
    fi

    # Restore database
    if pg_restore -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        --verbose --no-password --clean --if-exists "$backup_file"; then
        success "Database restored successfully from: $backup_file"
    else
        error "Database restore failed"
        exit 1
    fi
}

# Show usage information
show_usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  backup     Create a new database backup (default)"
    echo "  restore    Restore database from backup"
    echo "  list       List available backups"
    echo "  cleanup    Clean up old backup files"
    echo ""
    echo "Options:"
    echo "  -f FILE    Backup file for restore command"
    echo "  -d DAYS    Retention days for cleanup (default: $RETENTION_DAYS)"
    echo "  -h         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore -f ./backups/quiz_game_backup_20240115_120000.sql.gz"
    echo "  $0 list"
    echo "  $0 cleanup -d 7"
}

# Main function
main() {
    local command="backup"
    local restore_file=""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f)
                restore_file="$2"
                shift 2
                ;;
            -d)
                RETENTION_DAYS="$2"
                shift 2
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            backup|restore|list|cleanup)
                command="$1"
                shift
                ;;
            *)
                error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # Execute command
    case $command in
        backup)
            create_backup_dir
            if backup_database; then
                local backup_file=$(ls -t "$BACKUP_DIR"/quiz_game_backup_*.sql 2>/dev/null | head -1)
                if [[ -n "$backup_file" ]]; then
                    local compressed_file=$(compress_backup "$backup_file")
                    if verify_backup "$compressed_file"; then
                        cleanup_old_backups
                        success "Backup process completed successfully"
                    fi
                fi
            fi
            ;;
        restore)
            if [[ -z "$restore_file" ]]; then
                error "Backup file required for restore command. Use -f option."
                exit 1
            fi
            restore_database "$restore_file"
            ;;
        list)
            list_backups
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        *)
            error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"
