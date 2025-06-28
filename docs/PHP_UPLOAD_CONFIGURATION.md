# PHP Upload Configuration Requirements

This application requires PHP to be configured with a 4MB upload limit to support image uploads.

## Required PHP Settings

The following PHP configuration values must be set:

```ini
upload_max_filesize = 4M
post_max_size = 8M  # Should be larger than upload_max_filesize
```

## Development Environment

### macOS with Homebrew PHP

1. Locate your php.ini file:
   ```bash
   php --ini
   # Look for "Loaded Configuration File"
   ```

2. Edit the php.ini file:
   ```bash
   # For PHP 8.4 installed via Homebrew:
   sudo nano /opt/homebrew/etc/php/8.4/php.ini
   ```

3. Find and update these values:
   ```ini
   upload_max_filesize = 4M
   post_max_size = 8M
   ```

4. Restart your development server:
   ```bash
   # Stop current server (Ctrl+C)
   composer run dev
   ```

### Laravel Valet/Herd

If using Laravel Herd, edit the PHP configuration at:
```
~/Library/Application Support/Herd/config/php/<version>/php.ini
```

## Production Environment

### Apache with PHP-FPM

1. Edit the PHP configuration file (location varies by system):
   ```bash
   # Ubuntu/Debian
   sudo nano /etc/php/8.4/fpm/php.ini
   
   # CentOS/RHEL
   sudo nano /etc/php.ini
   ```

2. Update the values:
   ```ini
   upload_max_filesize = 4M
   post_max_size = 8M
   ```

3. Restart PHP-FPM:
   ```bash
   # Ubuntu/Debian
   sudo systemctl restart php8.4-fpm
   
   # CentOS/RHEL
   sudo systemctl restart php-fpm
   ```

### Nginx

No additional Nginx configuration is needed as these are PHP settings.

### Docker

Add these lines to your Dockerfile:
```dockerfile
RUN echo "upload_max_filesize = 4M" >> /usr/local/etc/php/conf.d/uploads.ini
RUN echo "post_max_size = 8M" >> /usr/local/etc/php/conf.d/uploads.ini
```

Or mount a custom php.ini file in docker-compose.yml:
```yaml
volumes:
  - ./docker/php/uploads.ini:/usr/local/etc/php/conf.d/uploads.ini
```

### Laravel Forge

1. In the Forge dashboard, go to your server
2. Click on "PHP" in the left sidebar
3. Click "Edit PHP FPM Configuration"
4. Update the values and save
5. Forge will automatically restart PHP-FPM

## Verification

After making changes, verify the configuration:

1. Check via command line:
   ```bash
   php -i | grep upload_max_filesize
   # Should output: upload_max_filesize => 4M => 4M
   ```

2. Check via web interface:
   ```bash
   # Visit /api/debug/upload-info (only in development)
   curl http://localhost:8000/api/debug/upload-info
   ```

3. Create a phpinfo.php file (remove after testing):
   ```php
   <?php phpinfo();
   ```

## Troubleshooting

If uploads still fail after configuration:

1. **Check all related settings:**
   - `upload_max_filesize` (must be at least 4M)
   - `post_max_size` (must be larger than upload_max_filesize)
   - `max_execution_time` (increase if uploads timeout)
   - `memory_limit` (must be larger than post_max_size)

2. **Ensure you've restarted the appropriate service:**
   - Development: Stop and restart `composer run dev`
   - Apache: `sudo systemctl restart apache2`
   - PHP-FPM: `sudo systemctl restart php8.4-fpm`
   - Docker: Rebuild the container

3. **Check error logs:**
   - Laravel: `storage/logs/laravel.log`
   - PHP: Check location with `php --ini`
   - Apache/Nginx: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`

## Security Considerations

- 4MB is a reasonable limit for image uploads
- Larger limits may expose your server to DoS attacks
- Consider implementing additional application-level validations:
  - File type checking
  - Image dimension limits
  - Rate limiting for uploads