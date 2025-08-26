pipeline {
    agent { label '37.49.225.142' }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        WORKDIR = '/root/site/Shoppi_Seller'
        COMPOSE_PROJECT_NAME = 'shoppi_seller'
        DOCKER_BUILDKIT = '1'
        COMPOSE_DOCKER_CLI_BUILD = '1'
        // Optional frontend build args (override with Jenkins creds/params or .env)
        // REACT_APP_API_URL = 'https://api-girl.liteease.com'
        // REACT_APP_RECAPTCHA_SITE_KEY = 'your_site_key'
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Prepare workspace') {
            steps {
                sh '''
                  set -e
                  sudo mkdir -p "${WORKDIR}"
                  sudo chown -R $(id -u):$(id -g) "${WORKDIR}"
                '''
            }
        }

        stage('Checkout') {
            steps {
                dir("${WORKDIR}") {
                    checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[
                        url: 'https://github.com/Trang-1707/Shoppi_Seller.git',
                        credentialsId: 'github-token'
                    ]]])
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                dir("${WORKDIR}") {
                    sh '''
                      set -e
                      docker compose -p "${COMPOSE_PROJECT_NAME}" build --no-cache backend frontend
                    '''
                }
            }
        }

        stage('Deploy (Up)') {
            steps {
                dir("${WORKDIR}") {
                    sh '''
                      set -e
                      # Minimal downtime update: recreate only targeted services without full stack teardown
                      docker compose -p "${COMPOSE_PROJECT_NAME}" up -d --no-deps --force-recreate backend frontend
                      docker compose -p "${COMPOSE_PROJECT_NAME}" ps
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment succeeded.'
        }
        failure {
            echo 'Deployment failed.'
        }
        always {
            dir("${WORKDIR}") {
                sh 'docker compose ls | cat || true'
            }
        }
    }
}


