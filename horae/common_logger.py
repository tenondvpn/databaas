import os
import logging
import logging.handlers

def init_log(
        log_path, 
        level=logging.INFO, 
        when="D", 
        backup=7,
        format=("%(asctime)s: %(levelname)s: %(filename)s:"
                "%(lineno)d * %(thread)d %(message)s"),
        datefmt="%Y-%m-%d %H:%M:%S"):
    """
    init_log - initialize log module

    Args:
      log_path      - Log file path prefix.
                      two files: log_path.log and log_path.log.wf
                      Any non-exist parent directories will be created
      level         - msg above the level will be displayed
                      DEBUG < INFO < WARNING < ERROR < CRITICAL
                      the default value is logging.INFO
      when          - how to split the log file by time interval
                      'S' : Seconds
                      'M' : Minutes
                      'H' : Hours
                      'D' : Days
                      'W' : Week day
                      default value: 'D'
      format        - format of the log
                      INFO: 12-09 18:02:42: log.py:40 * 139814749787872
      backup        - how many backup file to keep
                      default value: 7

    Raises:
        OSError: fail to create log directories
        IOError: fail to open log file
    """
    formatter = logging.Formatter(format, datefmt)
    logger = logging.getLogger()
    logger.setLevel(level)

    dir = os.path.dirname(log_path)
    if not os.path.isdir(dir):
        os.makedirs(dir)

    handler = logging.handlers.TimedRotatingFileHandler(
            log_path + ".log",
            when=when,
            backupCount=backup)
    handler.setLevel(level)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    handler = logging.handlers.TimedRotatingFileHandler(
            log_path + ".log.wf",
            when=when,
            backupCount=backup)
    handler.setLevel(logging.WARNING)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

def get_logger(
        logger_name,
        log_path, 
        level=logging.INFO, 
        when="D", 
        backup=7,
        format=("%(asctime)s: %(levelname)s: %(filename)s:"
                "%(lineno)d * %(thread)d %(message)s"),
        datefmt="%Y-%m-%d %H:%M:%S"):
    formatter = logging.Formatter(format, datefmt)
    logger = logging.getLogger(logger_name)
    logger.disabled = True
    logger.setLevel(level)

    dir = os.path.dirname(log_path)
    if not os.path.isdir(dir):
        os.makedirs(dir)

    handler = logging.handlers.TimedRotatingFileHandler(
            log_path + ".log",
            when=when,
            backupCount=backup)
    handler.setLevel(level)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    handler = logging.handlers.TimedRotatingFileHandler(
            log_path + ".log.wf",
            when=when,
            backupCount=backup)
    handler.setLevel(logging.WARNING)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger
