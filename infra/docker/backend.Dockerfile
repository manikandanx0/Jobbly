FROM python:3.10-slim 
WORKDIR /app 
COPY backend/requirements.txt . 
RUN pip install -r requirements.txt 
COPY backend /app 
CMD ["python","wsgi.py"] 
