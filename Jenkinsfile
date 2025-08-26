pipeline {
    agent { label '37.49.225.142' }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        WORKDIR = '/root/site/Shoppi_Seller'
        COMPOSE_PROJECT_NAME = 'shoppi'
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
                      docker compose down --remove-orphans || true
                      docker compose build --pull
                    '''
                }
            }
        }

        stage('Deploy (Up)') {
            steps {
                dir("${WORKDIR}") {
                    sh '''
                      set -e
                      # If you need to pass build args via env, ensure they exist in .env at ${WORKDIR}
                      docker compose up -d
                      docker compose ps
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


