from celery import Celery
import os
import os

def make_celery(app_name='nyaysetu'):
    celery = Celery(app_name)
    celery.conf.update(
        broker_url='redis://localhost:6379/0',
        result_backend='redis://localhost:6379/0',
        task_always_eager=True,  # Run synchronously if Redis is down
        broker_connection_retry_on_startup=True
    )
    return celery

celery_app = make_celery()
